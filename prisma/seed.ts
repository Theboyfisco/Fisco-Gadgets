import { PrismaClient } from '@prisma/client'
import * as fs from 'node:fs'
import * as path from 'node:path'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? ''
    }
  }
})
const imageCachePath = path.join(process.cwd(), 'prisma', 'product-image-cache.json')

type CachedImageEntry = {
  productName?: string
  images?: string[]
}

type ImageCacheFile = {
  items?: Record<string, CachedImageEntry>
}

const categories = [
  { id: "phones", name: "Smartphones", image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=400&auto=format&fit=crop" },
  { id: "laptops", name: "Laptops & MacBooks", image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=400&auto=format&fit=crop" },
  { id: "audio", name: "Audio & Headphones", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=400&auto=format&fit=crop" },
  { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=400&auto=format&fit=crop" }
];

const brands = [
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "Sony", slug: "sony" },
  { name: "Google", slug: "google" },
  { name: "Lenovo", slug: "lenovo" },
  { name: "Dell", slug: "dell" },
  { name: "ASUS", slug: "asus" },
  { name: "HP", slug: "hp" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Anker", slug: "anker" },
  { name: "Marshall", slug: "marshall" },
  { name: "Beats", slug: "beats" },
  { name: "Bose", slug: "bose" },
  { name: "JBL", slug: "jbl" },
  { name: "Sennheiser", slug: "sennheiser" },
  { name: "Razer", slug: "razer" },
  { name: "Xiaomi", slug: "xiaomi" },
  { name: "OnePlus", slug: "oneplus" },
  { name: "Nothing", slug: "nothing" },
  { name: "Tecno", slug: "tecno" },
  { name: "Infinix", slug: "infinix" },
  { name: "UGREEN", slug: "ugreen" },
  { name: "Belkin", slug: "belkin" },
  { name: "Baseus", slug: "baseus" },
  { name: "Keychron", slug: "keychron" },
  { name: "Logitech", slug: "logitech" },
];

const baseProducts = [
  // PHONES
  {
    id: "prod_1",
    name: "iPhone 15 Pro Max",
    price: 1850000,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop",
    categoryId: "phones",
    technicalSpecs: { battery: "4422mAh", storage: "256GB NVMe", ram: "8GB", condition: "New", screen: "6.7in OLED 120Hz" }
  },
  {
    id: "prod_1_2",
    name: "iPhone 15 Pro",
    price: 1650000,
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop",
    categoryId: "phones",
    technicalSpecs: { battery: "3274mAh", storage: "128GB NVMe", ram: "8GB", condition: "New", screen: "6.1in OLED 120Hz" }
  },
  {
    id: "prod_1_3",
    name: "iPhone 14 Pro Max",
    price: 1450000,
    image: "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=800&auto=format&fit=crop",
    categoryId: "phones",
    technicalSpecs: { battery: "4323mAh", storage: "256GB NVMe", ram: "6GB", condition: "Open Box", screen: "6.7in OLED 120Hz" }
  },
  {
    id: "prod_3",
    name: "Samsung Galaxy S24 Ultra",
    price: 1750000,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop",
    categoryId: "phones",
    technicalSpecs: { battery: "5000mAh", storage: "512GB UFS 4.0", ram: "12GB", condition: "New", screen: "6.8in Dynamic LTPO AMOLED 2X" }
  },
  {
    id: "prod_3_2",
    name: "Samsung Galaxy Z Fold 5",
    price: 2100000,
    image: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=800&auto=format&fit=crop",
    categoryId: "phones",
    technicalSpecs: { battery: "4400mAh", storage: "512GB", ram: "12GB", condition: "New", screen: "7.6in Foldable Dynamic AMOLED" }
  },
  {
    id: "prod_3_3",
    name: "Google Pixel 8 Pro",
    price: 1200000,
    image: "https://images.unsplash.com/photo-1696446702183-cbd13d78e1e7?q=80&w=800&auto=format&fit=crop",
    categoryId: "phones",
    technicalSpecs: { battery: "5050mAh", storage: "128GB", ram: "12GB", condition: "New", screen: "6.7in LTPO OLED" }
  },

  // LAPTOPS
  {
    id: "prod_2",
    name: "MacBook Pro M3",
    price: 3200000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop",
    categoryId: "laptops",
    technicalSpecs: { battery: "70Wh", storage: "512GB SSD", ram: "18GB", condition: "New", screen: "14.2in Liquid Retina XDR" }
  },
  {
    id: "prod_2_2",
    name: "MacBook Air M2",
    price: 1850000,
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop",
    categoryId: "laptops",
    technicalSpecs: { battery: "52.6Wh", storage: "256GB SSD", ram: "8GB", condition: "New", screen: "13.6in Liquid Retina" }
  },
  {
    id: "prod_2_3",
    name: "Dell XPS 15",
    price: 2400000,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&auto=format&fit=crop",
    categoryId: "laptops",
    technicalSpecs: { battery: "86Wh", storage: "1TB SSD", ram: "32GB", condition: "New", screen: "15.6in 4K OLED" }
  },
  {
    id: "prod_2_4",
    name: "ASUS ROG Zephyrus G14",
    price: 2150000,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=800&auto=format&fit=crop",
    categoryId: "laptops",
    technicalSpecs: { battery: "76Wh", storage: "1TB SSD", ram: "16GB", condition: "New", screen: "14in QHD 120Hz" }
  },

  // AUDIO
  {
    id: "prod_4",
    name: "Sony WH-1000XM5",
    price: 450000,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop",
    categoryId: "audio",
    technicalSpecs: { battery: "30 Hours", condition: "Refurbished", connectivity: "Bluetooth 5.2", noiseCancellation: "Industry Leading ANC" }
  },
  {
    id: "prod_5",
    name: "AirPods Pro (2nd Gen)",
    price: 285000,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop",
    categoryId: "audio",
    technicalSpecs: { battery: "6 Hours (30 with case)", condition: "New", connectivity: "Bluetooth 5.3", noiseCancellation: "Active + Transparency" }
  },
  {
    id: "prod_5_2",
    name: "AirPods Max",
    price: 650000,
    image: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=800&auto=format&fit=crop",
    categoryId: "audio",
    technicalSpecs: { battery: "20 Hours", condition: "New", connectivity: "Bluetooth 5.0", noiseCancellation: "Active ANC" }
  },
  {
    id: "prod_5_3",
    name: "Beats Studio Pro",
    price: 380000,
    image: "https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=800&auto=format&fit=crop",
    categoryId: "audio",
    technicalSpecs: { battery: "40 Hours", condition: "New", connectivity: "USB-C/Bluetooth", noiseCancellation: "Active ANC" }
  },
  {
    id: "prod_5_4",
    name: "Sony SRS-XG300 Speaker",
    price: 320000,
    image: "https://www.sony.ca/image/990c23317d5559ba35b67e564c12a5b3?bgc=FFFFFF&bgcolor=FFFFFF&fmt=pjpeg&wid=330",
    categoryId: "audio",
    technicalSpecs: { battery: "25 Hours", condition: "New", connectivity: "Bluetooth 5.2", protection: "IP67 Water Resistant" }
  },

  // ACCESSORIES
  {
    id: "prod_6",
    name: "iPad Pro 12.9 M2",
    price: 1550000,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { battery: "10758mAh", storage: "256GB SSD", ram: "8GB", condition: "New", screen: "12.9in Liquid Retina XDR Mini-LED" }
  },
  {
    id: "prod_7",
    name: "Apple MagSafe Charger",
    price: 45000,
    image: "https://www.apple.com/shop/mdp/echo/echo.png?app=com.apple.www.Store&country=US&environment=&eventType=pageview&feature=category-landing&format=common&host=no-js&locale=en-us&node=standard%2Fhome%2Fshop_accessories%2Fall_accessories%2Fmagsafe&pageHostname=no-js&pagePathname=no-js&pageResource=accessories-3&pageShopPath=no-js&pageUrl=no-js&pageViewId=no-js&recordTime=no-js&referer=no-js&referrer=no-js&region=amr&segment=Consumer&sf=Consumer",
    categoryId: "accessories",
    technicalSpecs: { condition: "New", compatibility: "iPhone 12 or later", wattage: "15W Fast Charge" }
  },
  {
    id: "prod_8",
    name: "iPhone 15 Leather Case",
    price: 35000,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { condition: "New", material: "Premium Leather", protection: "Drop + Scratch Resistant" }
  },
  {
    id: "prod_8_2",
    name: "Apple AirTag (4 Pack)",
    price: 125000,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { condition: "New", battery: "1 Year", connectivity: "Ultra Wideband / Bluetooth" }
  },
  {
    id: "prod_8_3",
    name: "Apple Pencil (2nd Gen)",
    price: 145000,
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { condition: "New", compatibility: "iPad Pro / iPad Air", charging: "Magnetic" }
  },
  {
    id: "prod_8_4",
    name: "Logitech MX Master 3S",
    price: 115000,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { condition: "New", sensor: "8K DPI", battery: "70 Days", connectivity: "Bluetooth / Logi Bolt" }
  },
  {
    id: "prod_9",
    name: "Apple Watch Ultra 2",
    price: 950000,
    image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { condition: "New", screen: "3000 nits Always-On Retina", battery: "36-72 Hours", protection: "100m Water Resistant" }
  },
  {
    id: "prod_10",
    name: "Keychron Q3 Mechanical Keyboard",
    price: 185000,
    image: "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { condition: "New", material: "Full CNC Aluminum", layout: "Tenkeyless", switchType: "Gateron G Pro Brown" }
  },
  {
    id: "prod_11",
    name: "Nothing Phone (2)",
    price: 980000,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop",
    categoryId: "phones",
    technicalSpecs: { battery: "4700mAh", storage: "256GB", ram: "12GB", condition: "New", screen: "6.7in LTPO OLED 120Hz" }
  },
  {
    id: "prod_12",
    name: "Lenovo Legion Slim 7",
    price: 2650000,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
    categoryId: "laptops",
    technicalSpecs: { battery: "99Wh", storage: "1TB SSD", ram: "32GB", condition: "New", screen: "16in WQXGA 240Hz" }
  },
  {
    id: "prod_13",
    name: "Marshall Stanmore III",
    price: 520000,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop",
    categoryId: "audio",
    technicalSpecs: { battery: "AC Powered", condition: "New", connectivity: "Bluetooth 5.2", sound: "80W Stereo" }
  },
  {
    id: "prod_14",
    name: "Anker 737 Power Bank",
    price: 175000,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { condition: "New", battery: "24,000mAh", output: "140W USB-C", display: "Smart Digital Screen" }
  }
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

const hashString = (value: string) =>
  Array.from(value).reduce((hash, char) => ((hash * 31 + char.charCodeAt(0)) >>> 0), 0);

const stockImagePools = {
  phones: [
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1696446702183-cbd13d78e1e7?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1200&auto=format&fit=crop"
  ],
  laptops: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop"
  ],
  audio: [
    "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545127398-14699f92334b?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop"
  ],
  accessories: [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1200&auto=format&fit=crop"
  ]
};

const pickImages = (pool: string[], seed: number, count: number) => {
  if (pool.length === 0) return [];
  const chosen: string[] = [];
  const base = hashString(`${seed}`) % pool.length;

  for (let i = 0; i < pool.length && chosen.length < count; i++) {
    const idx = (base + i * 13) % pool.length;
    const url = pool[idx];
    if (!chosen.includes(url)) {
      chosen.push(url);
    }
  }

  while (chosen.length < count) {
    chosen.push(pool[chosen.length % pool.length]);
  }

  return chosen;
};

const buildStockImages = (category: string, seed: number) => {
  const pool = stockImagePools[category as keyof typeof stockImagePools] ?? [];
  return pickImages(pool, seed, 3);
};

const categoryFallbackImages: Record<string, string[]> = {
  phones: stockImagePools.phones.slice(0, 3),
  laptops: stockImagePools.laptops.slice(0, 3),
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

const validateImageUrl = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
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

const normalizeProductImages = async (product: {
  id: string;
  categoryId: string;
  images: string[];
}) => {
  const valid = [];

  for (const url of product.images.slice(0, 3)) {
    if (await validateImageUrl(url)) {
      valid.push(url);
    }
  }

  const fallback = categoryFallbackImages[product.categoryId] ?? [];
  const normalized = valid.length > 0 ? valid : fallback;
  const padded = [...normalized];

  while (padded.length < 3) {
    padded.push(padded[0] ?? fallback[0] ?? stockImagePools.phones[0]);
  }

  return padded.slice(0, 3);
};

const readImageCache = (): ImageCacheFile => {
  if (!fs.existsSync(imageCachePath)) {
    return { items: {} }
  }

  try {
    return JSON.parse(fs.readFileSync(imageCachePath, 'utf8')) as ImageCacheFile
  } catch {
    return { items: {} }
  }
}

const chunk = <T,>(items: T[], size: number) => {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const upsertProductBatch = async (
  client: PrismaClient,
  batch: Array<{
    id: string
    name: string
    slug: string
    description: string
    price: number
    stock: number
    condition: "NEW" | "OPEN_BOX" | "REFURBISHED"
    technicalSpecs: Record<string, unknown>
    images: string[]
    categoryId: string
    brandId?: string | null
  }>
) => {
  for (const product of batch) {
    await client.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        condition: product.condition,
        technicalSpecs: product.technicalSpecs as any,
        images: product.images,
        categoryId: product.categoryId,
        brandId: product.brandId ?? null
      },
      create: product as any
    })
  }
}

const phoneCatalog = [
  { model: "iPhone 15 Pro Max", battery: "4422mAh", ram: "8GB", screen: "6.7in OLED 120Hz", price: 1850000 },
  { model: "iPhone 15 Pro", battery: "3274mAh", ram: "8GB", screen: "6.1in OLED 120Hz", price: 1650000 },
  { model: "iPhone 15 Plus", battery: "4383mAh", ram: "6GB", screen: "6.7in OLED", price: 1380000 },
  { model: "iPhone 15", battery: "3349mAh", ram: "6GB", screen: "6.1in OLED", price: 1250000 },
  { model: "Samsung Galaxy S24 Ultra", battery: "5000mAh", ram: "12GB", screen: "6.8in AMOLED 120Hz", price: 1750000 },
  { model: "Samsung Galaxy S24+", battery: "4900mAh", ram: "12GB", screen: "6.7in AMOLED 120Hz", price: 1480000 },
  { model: "Samsung Galaxy S24", battery: "4000mAh", ram: "8GB", screen: "6.2in AMOLED 120Hz", price: 1180000 },
  { model: "Samsung Galaxy Z Fold 5", battery: "4400mAh", ram: "12GB", screen: "7.6in Foldable AMOLED", price: 2100000 },
  { model: "Samsung Galaxy Z Flip 5", battery: "3700mAh", ram: "8GB", screen: "6.7in Foldable AMOLED", price: 1320000 },
  { model: "Google Pixel 8 Pro", battery: "5050mAh", ram: "12GB", screen: "6.7in LTPO OLED", price: 1200000 },
  { model: "Google Pixel 8", battery: "4575mAh", ram: "8GB", screen: "6.2in OLED", price: 950000 },
  { model: "Google Pixel 7 Pro", battery: "5000mAh", ram: "12GB", screen: "6.7in LTPO AMOLED", price: 890000 },
  { model: "OnePlus 12", battery: "5400mAh", ram: "16GB", screen: "6.82in AMOLED 120Hz", price: 1100000 },
  { model: "OnePlus 11", battery: "5000mAh", ram: "16GB", screen: "6.7in AMOLED 120Hz", price: 920000 },
  { model: "Nothing Phone (2)", battery: "4700mAh", ram: "12GB", screen: "6.7in LTPO OLED 120Hz", price: 980000 },
  { model: "Nothing Phone (2a)", battery: "5000mAh", ram: "12GB", screen: "6.7in AMOLED 120Hz", price: 620000 },
  { model: "Xiaomi 14 Ultra", battery: "5000mAh", ram: "16GB", screen: "6.73in AMOLED 120Hz", price: 1280000 },
  { model: "Xiaomi 13T Pro", battery: "5000mAh", ram: "12GB", screen: "6.67in AMOLED 144Hz", price: 860000 },
  { model: "Tecno Phantom V Fold 2", battery: "5750mAh", ram: "12GB", screen: "7.85in Foldable AMOLED", price: 980000 },
  { model: "Infinix Zero 30 5G", battery: "5000mAh", ram: "12GB", screen: "6.78in AMOLED 144Hz", price: 420000 }
];

const phoneStorageVariants = [
  { sku: "128GB", storage: "128GB", priceDelta: 0 },
  { sku: "256GB", storage: "256GB", priceDelta: 120000 },
  { sku: "512GB", storage: "512GB", priceDelta: 260000 },
  { sku: "1TB", storage: "1TB", priceDelta: 450000 },
  { sku: "12GB+256GB", storage: "256GB", ramDelta: "12GB", priceDelta: 90000 }
];

const laptopCatalog = [
  { model: "MacBook Pro 14 M3", battery: "72Wh", screen: "14.2in Liquid Retina XDR", price: 3200000 },
  { model: "MacBook Pro 16 M3 Pro", battery: "100Wh", screen: "16.2in Liquid Retina XDR", price: 4200000 },
  { model: "MacBook Air 13 M2", battery: "52.6Wh", screen: "13.6in Liquid Retina", price: 1850000 },
  { model: "MacBook Air 15 M3", battery: "66.5Wh", screen: "15.3in Liquid Retina", price: 2350000 },
  { model: "Dell XPS 13", battery: "55Wh", screen: "13.4in FHD+", price: 1750000 },
  { model: "Dell XPS 15", battery: "86Wh", screen: "15.6in 3.5K OLED", price: 2400000 },
  { model: "HP Spectre x360 14", battery: "68Wh", screen: "13.5in OLED", price: 2100000 },
  { model: "HP Envy 16", battery: "83Wh", screen: "16in 2.5K", price: 1950000 },
  { model: "Lenovo ThinkPad X1 Carbon Gen 12", battery: "57Wh", screen: "14in 2.8K OLED", price: 2450000 },
  { model: "Lenovo Legion Slim 7", battery: "99Wh", screen: "16in WQXGA 240Hz", price: 2650000 },
  { model: "ASUS ROG Zephyrus G14", battery: "76Wh", screen: "14in QHD 120Hz", price: 2150000 },
  { model: "ASUS Zenbook 14 OLED", battery: "75Wh", screen: "14in 2.8K OLED", price: 1680000 },
  { model: "Acer Swift X 14", battery: "76Wh", screen: "14.5in OLED", price: 1540000 },
  { model: "Acer Predator Helios Neo 16", battery: "90Wh", screen: "16in WQXGA 165Hz", price: 2050000 },
  { model: "MSI Stealth 14 Studio", battery: "72Wh", screen: "14in QHD+ 240Hz", price: 2250000 },
  { model: "MSI Raider GE78 HX", battery: "99Wh", screen: "17in QHD+ 240Hz", price: 3650000 },
  { model: "Razer Blade 14", battery: "68Wh", screen: "14in QHD+ 240Hz", price: 3150000 },
  { model: "Samsung Galaxy Book4 Pro", battery: "76Wh", screen: "16in AMOLED 120Hz", price: 1980000 },
  { model: "Microsoft Surface Laptop 6", battery: "54Wh", screen: "15in PixelSense", price: 2080000 },
  { model: "LG Gram 16", battery: "80Wh", screen: "16in WQXGA", price: 1880000 }
];

const laptopConfigVariants = [
  { sku: "16GB/512GB", ram: "16GB", storage: "512GB SSD", priceDelta: 0 },
  { sku: "16GB/1TB", ram: "16GB", storage: "1TB SSD", priceDelta: 180000 },
  { sku: "32GB/1TB", ram: "32GB", storage: "1TB SSD", priceDelta: 340000 },
  { sku: "32GB/2TB", ram: "32GB", storage: "2TB SSD", priceDelta: 520000 },
  { sku: "64GB/2TB", ram: "64GB", storage: "2TB SSD", priceDelta: 760000 }
];

const audioCatalog = [
  { model: "Sony WH-1000XM5", battery: "30 Hours", connectivity: "Bluetooth 5.2", feature: "Adaptive ANC", price: 450000 },
  { model: "Sony WF-1000XM5", battery: "8 Hours", connectivity: "Bluetooth 5.3", feature: "Adaptive ANC", price: 320000 },
  { model: "AirPods Pro (2nd Gen)", battery: "6 Hours", connectivity: "Bluetooth 5.3", feature: "Active ANC", price: 285000 },
  { model: "AirPods Max", battery: "20 Hours", connectivity: "Bluetooth 5.0", feature: "Spatial Audio", price: 650000 },
  { model: "Beats Studio Pro", battery: "40 Hours", connectivity: "USB-C / Bluetooth", feature: "ANC + Transparency", price: 380000 },
  { model: "Beats Fit Pro", battery: "6 Hours", connectivity: "Bluetooth 5.0", feature: "Secure-fit wingtips", price: 240000 },
  { model: "Bose QuietComfort Ultra Headphones", battery: "24 Hours", connectivity: "Bluetooth 5.3", feature: "Immersive Audio", price: 520000 },
  { model: "Bose QuietComfort Ultra Earbuds", battery: "6 Hours", connectivity: "Bluetooth 5.3", feature: "Immersive Audio", price: 310000 },
  { model: "Sennheiser Momentum 4 Wireless", battery: "60 Hours", connectivity: "Bluetooth 5.2", feature: "Hybrid ANC", price: 430000 },
  { model: "Sennheiser Accentum Plus", battery: "50 Hours", connectivity: "Bluetooth 5.2", feature: "Hybrid ANC", price: 260000 },
  { model: "JBL Tour One M2", battery: "50 Hours", connectivity: "Bluetooth 5.3", feature: "True Adaptive ANC", price: 295000 },
  { model: "JBL Live Pro 2", battery: "10 Hours", connectivity: "Bluetooth 5.2", feature: "Adaptive Noise Cancelling", price: 175000 },
  { model: "Marshall Stanmore III", battery: "AC Powered", connectivity: "Bluetooth 5.2", feature: "80W Stereo", price: 520000 },
  { model: "Marshall Acton III", battery: "AC Powered", connectivity: "Bluetooth 5.2", feature: "60W Stereo", price: 390000 },
  { model: "Marshall Emberton II", battery: "30 Hours", connectivity: "Bluetooth 5.1", feature: "IP67 Portable Speaker", price: 210000 },
  { model: "Anker Soundcore Space One", battery: "55 Hours", connectivity: "Bluetooth 5.3", feature: "Adaptive ANC", price: 95000 },
  { model: "Anker Soundcore Liberty 4 NC", battery: "10 Hours", connectivity: "Bluetooth 5.3", feature: "Adaptive ANC", price: 98000 },
  { model: "Nothing Ear (a)", battery: "9.5 Hours", connectivity: "Bluetooth 5.3", feature: "Smart ANC", price: 118000 },
  { model: "Google Pixel Buds Pro", battery: "11 Hours", connectivity: "Bluetooth 5.0", feature: "Silent Seal ANC", price: 165000 },
  { model: "Samsung Galaxy Buds2 Pro", battery: "5 Hours", connectivity: "Bluetooth 5.3", feature: "24-bit Hi-Fi", price: 195000 }
];

const audioFinishVariants = [
  { sku: "Black", priceDelta: 0 },
  { sku: "Silver", priceDelta: 12000 },
  { sku: "White", priceDelta: 8000 },
  { sku: "Midnight", priceDelta: 15000 },
  { sku: "Bundle", priceDelta: 22000 }
];

const accessoryCatalog = [
  { model: "Apple MagSafe Charger", feature: "15W Fast Charge", detail: "iPhone 12 or later", price: 45000 },
  { model: "Apple AirTag (4 Pack)", feature: "Ultra Wideband", detail: "Find My network", price: 125000 },
  { model: "Apple Pencil (2nd Gen)", feature: "Magnetic Charging", detail: "iPad Pro / Air", price: 145000 },
  { model: "Apple Watch Ultra 2", feature: "Always-On Retina", detail: "100m Water Resistant", price: 950000 },
  { model: "Logitech MX Master 3S", feature: "8K DPI", detail: "Bluetooth / Logi Bolt", price: 115000 },
  { model: "Keychron Q3", feature: "Tenkeyless", detail: "Full CNC Aluminum", price: 185000 },
  { model: "Anker 737 Power Bank", feature: "140W USB-C", detail: "24,000mAh", price: 175000 },
  { model: "Anker Prime 250W Charging Station", feature: "250W Desktop Charger", detail: "6-Port GaN", price: 210000 },
  { model: "Belkin BoostCharge Pro 3-in-1", feature: "MagSafe Stand", detail: "iPhone / Watch / AirPods", price: 165000 },
  { model: "UGREEN Nexode 100W Charger", feature: "GaN Fast Charger", detail: "4-Port USB-C", price: 78000 },
  { model: "TP-Link Deco XE75", feature: "Wi-Fi 6E Mesh", detail: "Tri-band", price: 285000 },
  { model: "Samsung T9 Portable SSD", feature: "USB 3.2 Gen 2x2", detail: "Up to 2000MB/s", price: 165000 },
  { model: "SanDisk Extreme Portable SSD V2", feature: "IP65 Rugged", detail: "USB-C 10Gbps", price: 145000 },
  { model: "Logitech MX Keys S", feature: "Backlit Keyboard", detail: "Bluetooth Multi-device", price: 128000 },
  { model: "Razer DeathAdder V3 Pro", feature: "Wireless Esports Mouse", detail: "Focus Pro 30K", price: 135000 },
  { model: "Samsung Galaxy Watch6 Classic", feature: "Rotating Bezel", detail: "Wear OS", price: 285000 },
  { model: "Apple Watch Series 9", feature: "S9 SiP", detail: "Always-On Retina", price: 620000 },
  { model: "Anker MagGo Wireless Charging Station", feature: "Qi2 Charging", detail: "Foldable Travel Dock", price: 98000 },
  { model: "Baseus Bowie WM02", feature: "TWS Earbuds", detail: "Bluetooth 5.3", price: 28000 },
  { model: "JBL Go 4", feature: "Portable Speaker", detail: "IP67", price: 52000 },
  { model: "Sony PlayStation DualSense", feature: "Haptic Feedback", detail: "Wireless Controller", price: 98000 },
  { model: "Microsoft Xbox Wireless Controller", feature: "Bluetooth", detail: "USB-C", price: 85000 },
  { model: "Elgato Stream Deck MK.2", feature: "15 LCD Keys", detail: "Creator Workflow", price: 165000 },
  { model: "Satechi USB-C Multiport Adapter", feature: "4K HDMI", detail: "USB-C PD Pass-through", price: 68000 },
  { model: "Nomad Modern Leather Case for iPhone 15 Pro", feature: "Horween Leather", detail: "MagSafe Compatible", price: 72000 }
];

const accessoryVariantSuffixes = [
  { sku: "Standard", priceDelta: 0 },
  { sku: "Pro", priceDelta: 18000 },
  { sku: "Max", priceDelta: 35000 },
  { sku: "Bundle", priceDelta: 22000 }
];

const buildPhoneProducts = () =>
  phoneCatalog.flatMap((item, modelIndex) =>
    phoneStorageVariants.map((variant, variantIndex) => ({
      id: `auto_phone_${modelIndex * phoneStorageVariants.length + variantIndex + 1}`,
      name: `${item.model} ${variant.sku}`,
      price: item.price + variant.priceDelta,
      image: buildStockImages("phones", hashString(`${item.model}-${variant.sku}`))[0],
      images: buildStockImages("phones", hashString(`${item.model}-${variant.sku}`)),
      categoryId: "phones",
      technicalSpecs: {
        battery: item.battery,
        storage: variant.storage,
        ram: variant.ramDelta || item.ram,
        condition: "NEW",
        screen: item.screen
      }
    }))
  );

const buildLaptopProducts = () =>
  laptopCatalog.flatMap((item, modelIndex) =>
    laptopConfigVariants.map((variant, variantIndex) => ({
      id: `auto_laptop_${modelIndex * laptopConfigVariants.length + variantIndex + 1}`,
      name: `${item.model} ${variant.sku}`,
      price: item.price + variant.priceDelta,
      image: buildStockImages("laptops", hashString(`${item.model}-${variant.sku}`))[0],
      images: buildStockImages("laptops", hashString(`${item.model}-${variant.sku}`)),
      categoryId: "laptops",
      technicalSpecs: {
        battery: item.battery,
        storage: variant.storage,
        ram: variant.ram,
        condition: "NEW",
        screen: item.screen
      }
    }))
  );

const buildAudioProducts = () =>
  audioCatalog.flatMap((item, modelIndex) =>
    audioFinishVariants.map((variant, variantIndex) => ({
      id: `auto_audio_${modelIndex * audioFinishVariants.length + variantIndex + 1}`,
      name: `${item.model} ${variant.sku}`,
      price: item.price + variant.priceDelta,
      image: buildStockImages("audio", hashString(`${item.model}-${variant.sku}`))[0],
      images: buildStockImages("audio", hashString(`${item.model}-${variant.sku}`)),
      categoryId: "audio",
      technicalSpecs: {
        battery: item.battery,
        condition: variant.sku === "Bundle" ? "OPEN_BOX" : "NEW",
        connectivity: item.connectivity,
        noiseCancellation: item.feature
      }
    }))
  );

const buildAccessoryProducts = () =>
  accessoryCatalog.flatMap((item, modelIndex) =>
    accessoryVariantSuffixes.map((variant, variantIndex) => ({
      id: `auto_accessory_${modelIndex * accessoryVariantSuffixes.length + variantIndex + 1}`,
      name: `${item.model} ${variant.sku}`,
      price: item.price + variant.priceDelta,
      image: buildStockImages("accessories", hashString(`${item.model}-${variant.sku}`))[0],
      images: buildStockImages("accessories", hashString(`${item.model}-${variant.sku}`)),
      categoryId: "accessories",
      technicalSpecs: {
        condition: variant.sku === "Bundle" ? "OPEN_BOX" : "NEW",
        compatibility: item.detail,
        warranty: `${12 + variantIndex * 6} Months`,
        output: item.feature
      }
    }))
  );

const buildAutoProducts = () => [
  ...buildPhoneProducts(),
  ...buildLaptopProducts(),
  ...buildAudioProducts(),
  ...buildAccessoryProducts()
];

const dummyProducts = [...baseProducts, ...buildAutoProducts()];

const brandMatchers = [
  { slug: "apple", tokens: ["apple", "iphone", "ipad", "macbook", "airpods", "watch", "pencil", "airtag", "magsafe"] },
  { slug: "samsung", tokens: ["samsung", "galaxy"] },
  { slug: "sony", tokens: ["sony"] },
  { slug: "google", tokens: ["google", "pixel"] },
  { slug: "lenovo", tokens: ["lenovo"] },
  { slug: "dell", tokens: ["dell", "xps"] },
  { slug: "asus", tokens: ["asus", "rog", "zenbook"] },
  { slug: "hp", tokens: ["hp", "spectre", "envy"] },
  { slug: "microsoft", tokens: ["microsoft", "surface"] },
  { slug: "anker", tokens: ["anker", "soundcore"] },
  { slug: "marshall", tokens: ["marshall"] },
  { slug: "beats", tokens: ["beats"] },
  { slug: "bose", tokens: ["bose"] },
  { slug: "jbl", tokens: ["jbl"] },
  { slug: "sennheiser", tokens: ["sennheiser"] },
  { slug: "razer", tokens: ["razer"] },
  { slug: "xiaomi", tokens: ["xiaomi"] },
  { slug: "oneplus", tokens: ["oneplus"] },
  { slug: "nothing", tokens: ["nothing"] },
  { slug: "tecno", tokens: ["tecno"] },
  { slug: "infinix", tokens: ["infinix"] },
  { slug: "ugreen", tokens: ["ugreen"] },
  { slug: "belkin", tokens: ["belkin"] },
  { slug: "baseus", tokens: ["baseus"] },
  { slug: "keychron", tokens: ["keychron"] },
  { slug: "logitech", tokens: ["logitech", "mx master", "mx keys"] },
];

const resolveBrandSlug = (name: string) => {
  const normalized = name.toLowerCase();
  for (const matcher of brandMatchers) {
    if (matcher.tokens.some((token) => normalized.includes(token))) {
      return matcher.slug;
    }
  }
  return null;
};


async function main() {
  console.log('Start seeding...')
  const imageCache = readImageCache()

  // 1. Seed Categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        slug: cat.id.toLowerCase(),
        image: cat.image
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.id.toLowerCase(),
        image: cat.image,
      },
    })
  }

  // 2. Seed Brands
  const brandRecords = await Promise.all(
    brands.map((brand) =>
      prisma.brand.upsert({
        where: { slug: brand.slug },
        update: { name: brand.name },
        create: { name: brand.name, slug: brand.slug },
        select: { id: true, slug: true },
      }),
    ),
  )
  const brandIdBySlug = new Map(brandRecords.map((brand) => [brand.slug, brand.id]))

  // 3. Seed Products
  const usedSlugs = new Set<string>()

  const productData = await Promise.all(dummyProducts.map(async (prod) => {
    const rawCondition = prod.technicalSpecs.condition || "New";
    const mappedCondition = rawCondition.toUpperCase().replace(/\s+/g, '_') as "NEW" | "OPEN_BOX" | "REFURBISHED";
    const cachedEntry = imageCache.items?.[prod.id]
    const cachedImages =
      cachedEntry?.productName === prod.name ? cachedEntry.images?.filter(Boolean) ?? [] : []
    const fallbackImages = "images" in prod ? prod.images : [prod.image]
    const images = cachedImages.length > 0 ? cachedImages : fallbackImages
    const baseSlug = slugify(prod.name)
    let slug = baseSlug

    if (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${prod.id.toLowerCase()}`
    }

    usedSlugs.add(slug)
    const resolvedBrandSlug = resolveBrandSlug(prod.name)

    return {
      id: prod.id,
      name: prod.name,
      slug,
      description: `Premium ${prod.name} with advanced features and top-tier performance.`,
      price: prod.price,
      stock: 50,
      condition: ["NEW", "OPEN_BOX", "REFURBISHED"].includes(mappedCondition) ? mappedCondition : "NEW",
      technicalSpecs: prod.technicalSpecs as any,
      images: await normalizeProductImages({
        id: prod.id,
        categoryId: prod.categoryId,
        images
      }),
      categoryId: prod.categoryId,
      brandId: resolvedBrandSlug ? brandIdBySlug.get(resolvedBrandSlug) ?? null : null
    };
  }));

  for (const batch of chunk(productData, 25)) {
    await upsertProductBatch(prisma, batch)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
