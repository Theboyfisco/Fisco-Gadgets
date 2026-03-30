import * as fs from "node:fs";
import * as path from "node:path";
import { chromium, type Page } from "playwright";
import { PrismaClient } from "@prisma/client";

type Provider = "official-page" | "fallback";

type CachedImageEntry = {
  productId: string;
  productName: string;
  familyKey: string;
  sourceUrl?: string;
  provider: Provider;
  images: string[];
  updatedAt: string;
};

type CacheFile = {
  generatedAt: string;
  items: Record<string, CachedImageEntry>;
  families: Record<string, CachedImageEntry>;
};

type BrandProfile = {
  domains: string[];
  searchHint: string;
};

type OfficialPageOverride = {
  match: RegExp;
  pageUrl: string;
};

const prisma = new PrismaClient();
const cachePath = path.join(process.cwd(), "prisma", "product-image-cache.json");
const imageCount = Math.max(1, Number(process.env.IMAGE_COUNT || "1") || 1);
let updateQueue: Promise<void> = Promise.resolve();

const brandProfiles: Array<{ match: RegExp; profile: BrandProfile }> = [
  { match: /^(iphone|ipad|airpods|max|watch|macbook|apple)/i, profile: { domains: ["apple.com"], searchHint: "site:apple.com" } },
  { match: /^samsung|galaxy|srs-xg|t9 portable ssd|watch6|buds2 pro|z fold|z flip/i, profile: { domains: ["samsung.com"], searchHint: "site:samsung.com" } },
  { match: /^pixel|google pixel|pixel buds/i, profile: { domains: ["store.google.com", "google.com"], searchHint: "site:store.google.com OR site:google.com" } },
  { match: /^oneplus/i, profile: { domains: ["oneplus.com"], searchHint: "site:oneplus.com" } },
  { match: /^xiaomi/i, profile: { domains: ["xiaomi.com", "mi.com"], searchHint: "site:xiaomi.com OR site:mi.com" } },
  { match: /^nothing/i, profile: { domains: ["nothing.tech"], searchHint: "site:nothing.tech" } },
  { match: /^tecno/i, profile: { domains: ["tecno-mobile.com"], searchHint: "site:tecno-mobile.com" } },
  { match: /^infinix/i, profile: { domains: ["infinixmobility.com"], searchHint: "site:infinixmobility.com" } },
  { match: /^dell/i, profile: { domains: ["dell.com"], searchHint: "site:dell.com" } },
  { match: /^hp /i, profile: { domains: ["hp.com"], searchHint: "site:hp.com" } },
  { match: /^lenovo/i, profile: { domains: ["lenovo.com"], searchHint: "site:lenovo.com" } },
  { match: /^asus/i, profile: { domains: ["asus.com"], searchHint: "site:asus.com" } },
  { match: /^acer/i, profile: { domains: ["acer.com"], searchHint: "site:acer.com" } },
  { match: /^msi/i, profile: { domains: ["msi.com"], searchHint: "site:msi.com" } },
  { match: /^razer/i, profile: { domains: ["razer.com"], searchHint: "site:razer.com" } },
  { match: /^sony/i, profile: { domains: ["sony.com", "sony.ca"], searchHint: "site:sony.com OR site:sony.ca" } },
  { match: /^bose/i, profile: { domains: ["bose.com"], searchHint: "site:bose.com" } },
  { match: /^sennheiser/i, profile: { domains: ["sennheiser-hearing.com", "sennheiser.com"], searchHint: "site:sennheiser-hearing.com OR site:sennheiser.com" } },
  { match: /^jbl/i, profile: { domains: ["jbl.com"], searchHint: "site:jbl.com" } },
  { match: /^marshall/i, profile: { domains: ["marshall.com"], searchHint: "site:marshall.com" } },
  { match: /^anker/i, profile: { domains: ["anker.com"], searchHint: "site:anker.com" } },
  { match: /^logitech/i, profile: { domains: ["logitech.com"], searchHint: "site:logitech.com" } },
  { match: /^keychron/i, profile: { domains: ["keychron.com"], searchHint: "site:keychron.com" } },
  { match: /^belkin/i, profile: { domains: ["belkin.com"], searchHint: "site:belkin.com" } },
  { match: /^ugreen/i, profile: { domains: ["ugreen.com"], searchHint: "site:ugreen.com" } },
  { match: /^tp-link/i, profile: { domains: ["tp-link.com"], searchHint: "site:tp-link.com" } },
  { match: /^sandisk/i, profile: { domains: ["sandisk.com"], searchHint: "site:sandisk.com" } },
  { match: /^microsoft/i, profile: { domains: ["microsoft.com"], searchHint: "site:microsoft.com" } },
  { match: /^elgato/i, profile: { domains: ["elgato.com"], searchHint: "site:elgato.com" } },
  { match: /^satechi/i, profile: { domains: ["satechi.net", "satechi.com"], searchHint: "site:satechi.net OR site:satechi.com" } },
  { match: /^nomad/i, profile: { domains: ["nomadgoods.com"], searchHint: "site:nomadgoods.com" } },
  { match: /^baseus/i, profile: { domains: ["baseus.com"], searchHint: "site:baseus.com" } }
];

const officialPageOverrides: OfficialPageOverride[] = [
  { match: /^iphone 15/i, pageUrl: "https://www.apple.com/newsroom/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/" },
  { match: /^iphone 14/i, pageUrl: "https://www.apple.com/newsroom/2022/09/apple-debuts-iphone-14-pro-and-iphone-14-pro-max/" },
  { match: /^samsung galaxy s24 ultra/i, pageUrl: "https://www.samsung.com/us/explore/mobile/buying-guide/introducing-samsung-galaxy-s24/" },
  { match: /^samsung galaxy z fold 5/i, pageUrl: "https://www.samsung.com/us/smartphones/galaxy-z-fold5/" },
  { match: /^samsung galaxy z flip 5/i, pageUrl: "https://www.samsung.com/us/smartphones/galaxy-z-flip5/" },
  { match: /^google pixel 8 pro/i, pageUrl: "https://store.google.com/in/product/pixel_8_pro" },
  { match: /^google pixel 8\b/i, pageUrl: "https://store.google.com/product/pixel_8" },
  { match: /^nothing phone \(2\)/i, pageUrl: "https://us.nothing.tech/products/phone-2" },
  { match: /^macbook pro/i, pageUrl: "https://www.apple.com/macbook-pro/" },
  { match: /^macbook air/i, pageUrl: "https://www.apple.com/macbook-air/" },
  { match: /^dell xps 15/i, pageUrl: "https://www.dell.com/en-us/shop/dell-laptops/xps-15-laptop/spd/xps-15-9530-laptop" },
  { match: /^asus rog zephyrus g14/i, pageUrl: "https://rog.asus.com/laptops/rog-zephyrus/rog-zephyrus-g14-2024/" },
  { match: /^sony wh-1000xm5/i, pageUrl: "https://electronics.sony.com/audio/headphones/headband/p/wh1000xm5-b" },
  { match: /^sony wf-1000xm5/i, pageUrl: "https://electronics.sony.com/audio/headphones/truly-wireless-earbuds/p/wf1000xm5-b" },
  { match: /^airpods pro/i, pageUrl: "https://www.apple.com/airpods-pro/" },
  { match: /^airpods max/i, pageUrl: "https://www.apple.com/airpods-max/" },
  { match: /^beats studio pro/i, pageUrl: "https://www.beatsbydre.com/headphones/studio-pro" },
  { match: /^apple watch ultra 2/i, pageUrl: "https://www.apple.com/apple-watch-ultra-2/" },
  { match: /^apple airtag/i, pageUrl: "https://www.apple.com/airtag/" },
  { match: /^apple magsafe charger/i, pageUrl: "https://www.apple.com/shop/product/MHXD3AM/A/magsafe-charger" },
  { match: /^apple pencil/i, pageUrl: "https://www.apple.com/apple-pencil/" },
  { match: /^logitech mx master 3s/i, pageUrl: "https://www.logitech.com/en-us/products/mice/mx-master-3s.html" },
  { match: /^keychron q3/i, pageUrl: "https://www.keychron.com/products/keychron-q3-qmk-custom-mechanical-keyboard" },
  { match: /^anker 737 power bank/i, pageUrl: "https://www.anker.com/products/a1289" },
  { match: /^marshall stanmore iii/i, pageUrl: "https://www.marshall.com/us/en/product/stanmore-iii" },
  { match: /^bose quietcomfort ultra headphones/i, pageUrl: "https://www.bose.com/p/headphones/quietcomfort-ultra-headphones/QCUH-HEADPHONEARN.html" },
  { match: /^bose quietcomfort ultra earbuds/i, pageUrl: "https://www.bose.com/p/earbuds/quietcomfort-ultra-earbuds/QCUE-HEADPHONEIN.html" },
  { match: /^lenovo legion slim 7/i, pageUrl: "https://www.lenovo.com/us/en/c/laptops/legion-laptops/legion-slim-series/" },
  { match: /^samsung galaxy watch ultra/i, pageUrl: "https://www.samsung.com/us/watches/galaxy-watch-ultra/" },
  { match: /^sony srs-xg300/i, pageUrl: "https://electronics.sony.com/audio/speakers/wireless-speakers/p/srsxg300-b" }
  ,
  { match: /^apple watch series 9/i, pageUrl: "https://www.apple.com/apple-watch-series-9/" },
  { match: /^razer blade 14/i, pageUrl: "https://www.razer.com/gaming-laptops/razer-blade-14" },
  { match: /^razer deathadder v3 pro/i, pageUrl: "https://www.razer.com/gaming-mice/razer-deathadder-v3-pro" },
  { match: /^logitech mx keys s/i, pageUrl: "https://www.logitech.com/es-mx/products/keyboards/mx-keys-s.html" },
  { match: /^oneplus 12/i, pageUrl: "https://www.oneplus.com/us/oneplus-12" },
  { match: /^marshall acton iii/i, pageUrl: "https://www.marshall.com/us/en/product/acton-iii" },
  { match: /^jbl go 4/i, pageUrl: "https://www.jbl.com/bluetooth-speakers/GO+4-.html" },
  { match: /^jbl live pro 2/i, pageUrl: "https://www.jbl.com/true-wireless/LIVE+PRO+2+TWS-.html" },
  { match: /^anker soundcore space one/i, pageUrl: "https://www.soundcore.com/products/a3035" },
  { match: /^anker soundcore liberty 4 nc/i, pageUrl: "https://www.soundcore.com/products/a3947" },
  { match: /^samsung galaxy watch6 classic/i, pageUrl: "https://www.samsung.com/us/watches/galaxy-watch6-classic/" },
  { match: /^acer swift x 14/i, pageUrl: "https://www.acer.com/us-en/laptops/swift/swift-x-14" },
  { match: /^acer predator helios neo 16/i, pageUrl: "https://www.acer.com/us-en/laptops/predator/helios-neo-16" },
  { match: /^msi stealth 14 studio/i, pageUrl: "https://www.msi.com/Laptop/Stealth-14-Studio-A13VX" },
  { match: /^microsoft xbox wireless controller/i, pageUrl: "https://www.xbox.com/en-US/accessories/controllers/xbox-wireless-controller" },
  { match: /^google pixel 7 pro/i, pageUrl: "https://store.google.com/product/pixel_7_pro" }
];

const variantSuffixes = [
  "Standard",
  "Pro",
  "Max",
  "Bundle",
  "Silver",
  "White",
  "Midnight",
  "Black",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "12GB+256GB",
  "16GB/512GB",
  "16GB/1TB",
  "32GB/1TB",
  "32GB/2TB",
  "64GB/2TB"
];

const parseArgs = () => {
  const args = process.argv.slice(2);
  const limitArg = args.find((arg) => arg.startsWith("--limit="));
  const offsetArg = args.find((arg) => arg.startsWith("--offset="));
  const concurrencyArg = args.find((arg) => arg.startsWith("--concurrency="));
  const refresh = args.includes("--refresh");
  const onlyFallback = args.includes("--only-fallback");
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
  const offset = offsetArg ? Number(offsetArg.split("=")[1]) : 0;
  const concurrency = concurrencyArg ? Number(concurrencyArg.split("=")[1]) : 3;

  return {
    limit: Number.isFinite(limit) ? limit : undefined,
    offset: Number.isFinite(offset) ? offset : 0,
    concurrency: Number.isFinite(concurrency) ? concurrency : 3,
    refresh,
    onlyFallback
  };
};

const readCache = (): CacheFile => {
  if (!fs.existsSync(cachePath)) {
    return { generatedAt: new Date().toISOString(), items: {}, families: {} };
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(cachePath, "utf8")) as CacheFile;
    return {
      generatedAt: parsed.generatedAt || new Date().toISOString(),
      items: parsed.items || {},
      families: parsed.families || {}
    };
  } catch {
    return { generatedAt: new Date().toISOString(), items: {}, families: {} };
  }
};

const writeCache = (cache: CacheFile) => {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
};

const queueProductUpdate = (productId: string, images: string[]) => {
  const run = updateQueue.then(() =>
    prisma.product.update({
      where: { id: productId },
      data: { images }
    })
  );

  updateQueue = run.then(
    () => undefined,
    () => undefined
  );

  return run;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

const stripVariantSuffixes = (value: string) => {
  let current = value.trim();
  let changed = true;

  while (changed) {
    changed = false;
    for (const suffix of variantSuffixes) {
      const re = new RegExp(`\\s+${suffix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
      if (re.test(current)) {
        current = current.replace(re, "").trim();
        changed = true;
      }
    }
  }

  return current;
};

const getFamilyKey = (name: string) => slugify(stripVariantSuffixes(name));

const getBrandProfile = (name: string): BrandProfile => {
  const normalized = stripVariantSuffixes(name).toLowerCase();
  const matched = brandProfiles.find(({ match }) => match.test(normalized));
  return matched?.profile ?? { domains: [], searchHint: "" };
};

const normalizeUrl = (value: string, baseUrl?: string) => {
  const trimmed = value.trim();
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  if (baseUrl && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed, baseUrl).toString();
    } catch {
      return trimmed;
    }
  }
  return trimmed;
};

const isValidImageUrl = (value: string) => {
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return false;
  }

  try {
    const url = new URL(value);
    return !url.pathname.endsWith(".svg");
  } catch {
    return false;
  }
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
    return response.ok && (contentType.startsWith("image/") || contentType.includes("octet-stream"));
  } catch {
    return false;
  }
};

const validateCandidates = async (candidates: string[]) => {
  const unique = Array.from(new Set(candidates.map((candidate) => normalizeUrl(candidate)).filter(isValidImageUrl)));
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

const fetchHtml = async (url: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept: "text/html,application/xhtml+xml"
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const extractLinksFromHtml = (html: string, selectors: Array<{ regex: RegExp; group: number }>, baseUrl?: string) => {
  const results: string[] = [];
  for (const { regex, group } of selectors) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html))) {
      const value = match[group];
      if (value) {
        results.push(value);
      }
    }
  }
  return results.map((value) => normalizeUrl(value, baseUrl));
};

const searchDuckDuckGo = async (_page: Page, query: string) => {
  const html = await fetchHtml(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`);
  if (!html) {
    return [];
  }

  return extractLinksFromHtml(html, [
    {
      regex: /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"/gi,
      group: 1
    }
  ], "https://html.duckduckgo.com");
};

const searchBing = async (_page: Page, query: string) => {
  const html = await fetchHtml(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
  if (!html) {
    return [];
  }

  return extractLinksFromHtml(html, [
    {
      regex: /<li[^>]*class="[^"]*b_algo[^"]*"[\s\S]*?<h2><a[^>]*href="([^"]+)"/gi,
      group: 1
    }
  ], "https://www.bing.com");
};

const installFastRouting = async (page: Page) => {
  await page.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (type !== "document") {
      return route.abort();
    }
    return route.continue();
  });
};

const unwrapRedirectUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("duckduckgo.com")) {
      const uddg = parsed.searchParams.get("uddg");
      if (uddg) {
        return decodeURIComponent(uddg);
      }
    }
    return url;
  } catch {
    return url;
  }
};

const isAllowedDomain = (url: string, domains: string[]) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
};

const resolveOfficialUrl = async (page: Page, name: string, profile: BrandProfile) => {
  const queries = [
    `${profile.searchHint} "${name}"`,
    `${profile.searchHint} ${name}`,
    `"${name}" ${profile.searchHint}`
  ];

  for (const query of queries) {
    const ddgLinks = await searchDuckDuckGo(page, query);
    const ddgCandidate = ddgLinks.map(unwrapRedirectUrl).find((url) => isAllowedDomain(url, profile.domains));
    if (ddgCandidate) {
      return ddgCandidate;
    }

    const bingLinks = await searchBing(page, query);
    const bingCandidate = bingLinks.map(unwrapRedirectUrl).find((url) => isAllowedDomain(url, profile.domains));
    if (bingCandidate) {
      return bingCandidate;
    }
  }

  return null;
};

const collectOfficialImageCandidatesFromHtml = (html: string, baseUrl?: string) => {
  const results: string[] = [];

  const metaPatterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+property=["']og:image:url["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+name=["']twitter:image:src["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/gi
  ];

  for (const regex of metaPatterns) {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html))) {
      if (match[1]) {
        results.push(normalizeUrl(match[1], baseUrl));
      }
    }
  }

  const ldJsonRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;
  while ((scriptMatch = ldJsonRegex.exec(html))) {
    const text = scriptMatch[1]?.trim();
    if (!text) {
      continue;
    }

    try {
      const parsed = JSON.parse(text);
      const values = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of values) {
        if (typeof item?.image === "string") {
          results.push(normalizeUrl(item.image, baseUrl));
        } else if (Array.isArray(item?.image)) {
          for (const image of item.image) {
            if (typeof image === "string") {
              results.push(normalizeUrl(image, baseUrl));
            } else if (image?.url) {
              results.push(normalizeUrl(image.url, baseUrl));
            }
          }
        } else if (item?.image?.url) {
          results.push(normalizeUrl(item.image.url, baseUrl));
        }
      }
    } catch {
      continue;
    }
  }

  return results;
};

const collectOfficialImageCandidates = async (page: Page, url: string) => {
  const fetchedHtml = await fetchHtml(url);
  if (fetchedHtml) {
    const candidates = collectOfficialImageCandidatesFromHtml(fetchedHtml, url);
    if (candidates.length > 0) {
      return candidates;
    }
  }

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 30000
  });

  await page.waitForTimeout(500);
  const renderedHtml = await page.content();
  return collectOfficialImageCandidatesFromHtml(renderedHtml, url);
};

const buildFallbackImages = (categoryId: string, name: string) => {
  const seed = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pools: Record<string, string[]> = {
    phones: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=1200&auto=format&fit=crop"
    ],
    laptops: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1200&auto=format&fit=crop"
    ],
    audio: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1200&auto=format&fit=crop",
      "https://www.sony.ca/image/990c23317d5559ba35b67e564c12a5b3?bgc=FFFFFF&bgcolor=FFFFFF&fmt=pjpeg&wid=330"
    ],
    accessories: [
      "https://www.apple.com/shop/mdp/echo/echo.png?app=com.apple.www.Store&country=US&environment=&eventType=pageview&feature=category-landing&format=common&host=no-js&locale=en-us&node=standard%2Fhome%2Fshop_accessories%2Fall_accessories%2Fmagsafe&pageHostname=no-js&pagePathname=no-js&pageResource=accessories-3&pageShopPath=no-js&pageUrl=no-js&pageViewId=no-js&recordTime=no-js&referer=no-js&referrer=no-js&region=amr&segment=Consumer&sf=Consumer",
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airtag-1pack-select-202601?.v=eVZIdm00RE01SWs3QURJMUxNRitlVk12RjAvdFhnV3NiTDFvRk50VzZkaUtnZmtxNjIrTXJQRDA5VVdUdkt0QWJIQmdjOTlUQmJhQko2UzRaV3VjdmRBYlZ6cXFZeHZnbVRwbk5oeVNic2c&fmt=png-alpha&hei=582&wid=532",
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1200&auto=format&fit=crop"
    ]
  };

  const pool = pools[categoryId] || pools.phones;
  return [pool[seed % pool.length], pool[(seed + 1) % pool.length], pool[(seed + 2) % pool.length]];
};

const resolveProductImages = async (page: Page, product: { id: string; name: string; categoryId: string }, cache: CacheFile) => {
  const familyKey = getFamilyKey(product.name);
  const cachedFamily = cache.families[familyKey];
  if (cachedFamily?.provider === "official-page" && cachedFamily?.images?.length) {
    return {
      provider: cachedFamily.provider,
      familyKey,
      sourceUrl: cachedFamily.sourceUrl,
      images: cachedFamily.images.slice(0, imageCount)
    };
  }

  const profile = getBrandProfile(product.name);
  const override = officialPageOverrides.find(({ match }) => match.test(stripVariantSuffixes(product.name)));
  const officialUrl = override?.pageUrl || (await resolveOfficialUrl(page, stripVariantSuffixes(product.name), profile));

  if (officialUrl) {
    const candidates = await collectOfficialImageCandidates(page, officialUrl);
    const images = await validateCandidates(candidates);
    if (images.length > 0) {
      return {
        provider: "official-page" as const,
        familyKey,
        sourceUrl: officialUrl,
        images: images.slice(0, imageCount)
      };
    }
  }

  const fallbackImages = buildFallbackImages(product.categoryId, product.name);
  return {
    provider: "fallback" as const,
    familyKey,
    sourceUrl: officialUrl ?? undefined,
    images: fallbackImages
  };
};

async function main() {
  const { limit, offset, concurrency, refresh, onlyFallback } = parseArgs();
  const cache = readCache();

  let products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      categoryId: true
    },
      ...(typeof limit === "number" ? { skip: offset, take: limit } : {})
    });

  if (onlyFallback) {
    products = products.filter((product) => cache.items[product.id]?.provider === "fallback" || !cache.items[product.id]);
  }

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
    await installFastRouting(page);
    try {
      while (true) {
        const product = nextProduct();
        if (!product) {
          break;
        }

        const familyKey = getFamilyKey(product.name);
        const cachedProduct = cache.items[product.id];
        const cachedFamily = cache.families[familyKey];
        if (
          !refresh &&
          ((cachedProduct?.images?.length ?? 0) >= imageCount ||
            (cachedFamily?.provider === "official-page" && (cachedFamily?.images?.length ?? 0) >= imageCount))
        ) {
          console.log(`[${workerId}] Skipping ${product.id}: cached`);
          continue;
        }

        console.log(`[${workerId}] Resolving ${product.id}: ${product.name}`);
        const result = await resolveProductImages(page, product, cache);

        cache.items[product.id] = {
          productId: product.id,
          productName: product.name,
          familyKey: result.familyKey,
          sourceUrl: result.sourceUrl,
          provider: result.provider,
          images: result.images,
          updatedAt: new Date().toISOString()
        };
        if (result.provider === "official-page") {
          cache.families[result.familyKey] = cache.items[product.id];
        }

        writeCache({
          generatedAt: new Date().toISOString(),
          items: cache.items,
          families: cache.families
        });

        await queueProductUpdate(product.id, result.images);

        await page.waitForTimeout(50);
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
