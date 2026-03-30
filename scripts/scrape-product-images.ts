import * as fs from "node:fs";
import * as path from "node:path";
import { chromium, type Page } from "playwright";
import { PrismaClient } from "@prisma/client";

type Provider = "duckduckgo" | "bing";

type CachedImageEntry = {
  productId: string;
  productName: string;
  query: string;
  provider: Provider | "fallback";
  images: string[];
  updatedAt: string;
};

type CacheFile = {
  generatedAt: string;
  items: Record<string, CachedImageEntry>;
};

const prisma = new PrismaClient();
const cachePath = path.join(process.cwd(), "prisma", "product-image-cache.json");
const imageCount = 3;
const categoryKeywords: Record<string, string> = {
  phones: "smartphone mobile phone",
  laptops: "laptop notebook computer",
  audio: "headphones earbuds speaker audio",
  accessories: "tech accessory gadget charger keyboard mouse smartwatch"
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const limitArg = args.find((arg) => arg.startsWith("--limit="));
  const offsetArg = args.find((arg) => arg.startsWith("--offset="));
  const concurrencyArg = args.find((arg) => arg.startsWith("--concurrency="));
  const refresh = args.includes("--refresh");
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
  const offset = offsetArg ? Number(offsetArg.split("=")[1]) : 0;
  const concurrency = concurrencyArg ? Number(concurrencyArg.split("=")[1]) : 4;

  return {
    limit: Number.isFinite(limit) ? limit : undefined,
    offset: Number.isFinite(offset) ? offset : 0,
    concurrency: Number.isFinite(concurrency) ? concurrency : 4,
    refresh
  };
};

const readCache = (): CacheFile => {
  if (!fs.existsSync(cachePath)) {
    return { generatedAt: new Date().toISOString(), items: {} };
  }

  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf8")) as CacheFile;
  } catch {
    return { generatedAt: new Date().toISOString(), items: {} };
  }
};

const writeCache = (cache: CacheFile) => {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
};

const isValidImageUrl = (value: string) => {
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return false;
  }

  const invalidHosts = [
    "duckduckgo.com",
    "bing.com",
    "external-content.duckduckgo.com",
    "r.bing.com",
    "th.bing.com"
  ];

  try {
    const url = new URL(value);
    return !invalidHosts.includes(url.hostname) && !url.pathname.endsWith(".svg");
  } catch {
    return false;
  }
};

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return trimmed;
};

const checkImage = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept: "image/*"
      }
    });

    const contentType = response.headers.get("content-type") || "";
    response.body?.cancel();
    return response.ok && contentType.startsWith("image/");
  } catch {
    return false;
  }
};

const validateCandidates = async (candidates: string[]) => {
  const unique = Array.from(new Set(candidates.map(normalizeUrl).filter(isValidImageUrl)));
  const valid: string[] = [];

  for (const candidate of unique) {
    if (await checkImage(candidate)) {
      valid.push(candidate);
    }

    if (valid.length >= imageCount) {
      break;
    }
  }

  return valid;
};

const buildQuery = (name: string, categoryId: string) => {
  const withoutCounter = name.replace(/\s+\d+$/, "").trim();
  const keywords = categoryKeywords[categoryId] ?? categoryId;
  return `${withoutCounter} ${keywords} product photo`;
};

const extractDuckDuckGoImages = async (page: Page, query: string) => {
  await page.goto(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iar=images&iax=images&ia=images`, {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });

  await page.waitForTimeout(1200);

  const images = await page.evaluate(() => {
    const results: string[] = [];
    const selectors = [
      "img.tile--img__img",
      "[data-testid='img_tile'] img",
      ".tile img",
      "img"
    ];

    for (const selector of selectors) {
      const nodes = Array.from(document.querySelectorAll<HTMLImageElement>(selector));
      for (const node of nodes) {
        const src = node.currentSrc || node.src || node.getAttribute("data-src") || "";
        if (src) {
          results.push(src);
        }
      }

      if (results.length > 0) {
        break;
      }
    }

    return results;
  });

  return validateCandidates(images);
};

const extractBingImages = async (page: Page, query: string) => {
  await page.goto(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`, {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });

  await page.waitForTimeout(1200);

  const images = await page.evaluate(() => {
    const results: string[] = [];
    const cards = Array.from(document.querySelectorAll<HTMLElement>("a.iusc"));

    for (const card of cards) {
      const metadata = card.getAttribute("m");
      if (!metadata) {
        continue;
      }

      try {
        const parsed = JSON.parse(metadata) as { murl?: string };
        if (parsed.murl) {
          results.push(parsed.murl);
        }
      } catch {
        continue;
      }
    }

    return results;
  });

  return validateCandidates(images);
};

const scrapeImages = async (page: Page, query: string) => {
  const providers: Array<{ name: Provider; run: () => Promise<string[]> }> = [
    { name: "duckduckgo", run: () => extractDuckDuckGoImages(page, query) },
    { name: "bing", run: () => extractBingImages(page, query) }
  ];

  for (const provider of providers) {
    try {
      const images = await provider.run();
      if (images.length > 0) {
        return { provider: provider.name, images };
      }
    } catch {
      continue;
    }
  }

  return { provider: "bing" as Provider, images: [] };
};

async function main() {
  const { limit, offset, concurrency, refresh } = parseArgs();
  const cache = readCache();

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      categoryId: true
    },
    ...(typeof limit === "number" ? { skip: offset, take: limit } : {})
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 }
  });

  let cursor = 0;
  const nextProduct = () => products[cursor++];

  const worker = async (workerId: number) => {
    const page = await context.newPage();
    try {
      while (true) {
        const product = nextProduct();
        if (!product) {
          break;
        }

        const cached = cache.items[product.id];
        if (!refresh && cached?.images && cached.images.length >= imageCount) {
          console.log(`[${workerId}] Skipping ${product.id}: cached`);
          continue;
        }

        const query = buildQuery(product.name, product.categoryId);
        console.log(`[${workerId}] Scraping ${product.id}: ${query}`);

        const result = await scrapeImages(page, query);
        if (result.images.length === 0) {
          console.log(`[${workerId}] No valid images found for ${product.id}`);
          continue;
        }

        cache.items[product.id] = {
          productId: product.id,
          productName: product.name,
          query,
          provider: result.provider,
          images: result.images,
          updatedAt: new Date().toISOString()
        };

        writeCache({
          generatedAt: new Date().toISOString(),
          items: cache.items
        });

        await prisma.product.update({
          where: { id: product.id },
          data: { images: result.images }
        });

        await page.waitForTimeout(300);
      }
    } finally {
      await page.close();
    }
  };

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, (_, index) => worker(index + 1)));

  await context.close();
  await browser.close();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
