import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { id: "phones", name: "Smartphones", image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=400&auto=format&fit=crop" },
  { id: "laptops", name: "Laptops & MacBooks", image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=400&auto=format&fit=crop" },
  { id: "audio", name: "Audio & Headphones", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=400&auto=format&fit=crop" },
  { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=400&auto=format&fit=crop" }
];

const dummyProducts = [
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
    image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=800&auto=format&fit=crop",
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
    image: "https://images.unsplash.com/photo-1619890145610-1845bb5b1287?q=80&w=800&auto=format&fit=crop",
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


async function main() {
  console.log('Start seeding...')

  // 1. Seed Categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.id.toLowerCase(),
        image: cat.image,
      },
    })
  }

  // 2. Seed Products
  for (const prod of dummyProducts) {
    const rawCondition = prod.technicalSpecs.condition || "New";
    const mappedCondition = rawCondition.toUpperCase().replace(/\s+/g, '_') as "NEW" | "OPEN_BOX" | "REFURBISHED";

    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        description: `Premium ${prod.name} with advanced features and top-tier performance.`,
        price: prod.price,
        stock: 50,
        condition: ["NEW", "OPEN_BOX", "REFURBISHED"].includes(mappedCondition) ? mappedCondition : "NEW",
        technicalSpecs: prod.technicalSpecs,
        images: [prod.image],
        categoryId: prod.categoryId,
      },
    })
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
