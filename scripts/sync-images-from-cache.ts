import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaClient } from "@prisma/client";

type CachedImageEntry = {
  provider?: "official-page" | "fallback";
  images?: string[];
};

type CacheFile = {
  items?: Record<string, CachedImageEntry>;
};

const prisma = new PrismaClient();
const cachePath = path.join(process.cwd(), "prisma", "product-image-cache.json");
const safeCategoryImages: Record<string, string[]> = {
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
    "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=1200&auto=format&fit=crop"
  ],
  accessories: [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1200&auto=format&fit=crop"
  ]
};

const readCache = (): CacheFile => {
  if (!fs.existsSync(cachePath)) {
    return { items: {} };
  }

  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf8")) as CacheFile;
  } catch {
    return { items: {} };
  }
};

const pickSafeImages = (categoryId: string) => safeCategoryImages[categoryId] ?? safeCategoryImages.phones;

async function main() {
  const cache = readCache();
  const products = await prisma.product.findMany({
    select: {
      id: true,
      categoryId: true
    }
  });

  let updated = 0;

  for (const product of products) {
    const cached = cache.items?.[product.id];
    const nextImages = cached?.provider === "official-page" && cached.images?.length
      ? cached.images.slice(0, 3)
      : pickSafeImages(product.categoryId);

    await prisma.product.update({
      where: { id: product.id },
      data: { images: nextImages }
    });
    updated += 1;
  }

  console.log(`Updated ${updated} products`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
