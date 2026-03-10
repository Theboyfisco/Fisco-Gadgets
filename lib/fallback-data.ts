export interface NavCategory {
  id: string;
  name: string;
  image?: string;
}

export interface HomeProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  technicalSpecs: {
    battery?: string;
    storage?: string;
    ram?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export const fallbackCategories: NavCategory[] = [
  { id: "phones", name: "Smartphones", image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=400&auto=format&fit=crop" },
  { id: "laptops", name: "Laptops & MacBooks", image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=400&auto=format&fit=crop" },
  { id: "audio", name: "Audio & Headphones", image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=400&auto=format&fit=crop" },
  { id: "accessories", name: "Accessories", image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=400&auto=format&fit=crop" },
];

export const fallbackFeaturedProducts: HomeProduct[] = [
  {
    id: "fallback_1",
    name: "Nothing Phone (2)",
    price: 980000,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop",
    categoryId: "phones",
    technicalSpecs: { battery: "4700mAh", storage: "256GB", ram: "12GB" },
  },
  {
    id: "fallback_2",
    name: "Lenovo Legion Slim 7",
    price: 2650000,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=800&auto=format&fit=crop",
    categoryId: "laptops",
    technicalSpecs: { battery: "99Wh", storage: "1TB SSD", ram: "32GB" },
  },
  {
    id: "fallback_3",
    name: "Marshall Stanmore III",
    price: 520000,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop",
    categoryId: "audio",
    technicalSpecs: { battery: "AC Powered", storage: "N/A", ram: "N/A" },
  },
  {
    id: "fallback_4",
    name: "Anker 737 Power Bank",
    price: 175000,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop",
    categoryId: "accessories",
    technicalSpecs: { battery: "24,000mAh", storage: "N/A", ram: "N/A" },
  },
];
