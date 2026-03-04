import { BentoProductCard } from "@/components/product/BentoProductCard";
import { ShieldCheck, Truck, Clock, CreditCard } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";

export default async function Home() {
  const [dbProducts, dbCategories] = await Promise.all([
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    prisma.category.findMany()
  ]);

  // Map DB products to frontend Product type
  const featuredProducts = dbProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images[0],
    categoryId: p.categoryId,
    technicalSpecs: p.technicalSpecs as any
  }));

  return (
    <div className="min-h-screen pb-24">

      <main className="container mx-auto px-4 pt-12 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute top-40 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px] -z-10 animate-pulse delay-700" />

        {/* Hero Section */}
        <section className="mb-24 flex flex-col lg:flex-row items-center justify-between gap-12 pt-8 lg:pt-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-border-subtle text-sm text-primary mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Official Apple & Samsung Distributors in Asaba
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white mb-8 leading-[1.1]">
              Elevate Your <br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent">Digital Lifestyle.</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary max-w-xl mb-10 mx-auto lg:mx-0 leading-relaxed">
              Experience the pinnacle of technology. Authentic iPhones, MacBooks, and high-performance gadgets delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="#featured" className="bg-primary text-base font-bold px-10 py-4 rounded-standard hover:bg-emerald-400 transition-all shadow-glow text-center hover:scale-105 active:scale-95">
                Explore Deals
              </Link>
              <Link href="/category/phones" className="bg-white/5 border border-border-subtle text-white font-bold px-10 py-4 rounded-standard hover:bg-white/10 transition-all text-center">
                View Catalog
              </Link>
            </div>
          </div>

          <div className="flex-1 relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[2rem] blur-2xl -z-10" />
              <div className="w-full h-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4">
                    <div className="bg-primary/20 text-primary text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border border-primary/30">
                       Best Seller
                    </div>
                 </div>
                 <Image 
                   src={featuredProducts[0]?.image || "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=800&auto=format&fit=crop"}
                   alt="Featured Product"
                   fill
                   sizes="(max-width: 1024px) 100vw, 50vw"
                   priority
                   className="object-contain p-12 group-hover:scale-110 transition-transform duration-700"
                 />
                 <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5">
                    <p className="text-secondary text-xs uppercase font-bold tracking-widest mb-1">Latest Release</p>
                    <h4 className="text-white text-xl font-bold">{featuredProducts[0]?.name || "New Arrival"}</h4>
                    <p className="text-primary font-bold">
                      {featuredProducts[0] ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(featuredProducts[0].price) : "Coming Soon"}
                    </p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dbCategories.map((category: any) => (
              <Link href={`/category/${category.id}`} key={category.id} className="group relative h-40 rounded-standard overflow-hidden border border-border-subtle hover:border-primary/50 transition-colors">
                <Image 
                  src={category.image} 
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <h3 className="text-white font-bold text-lg text-center drop-shadow-md">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust Indicators Section */}
        <section className="mb-24 bg-white/5 border border-white/5 rounded-2xl p-8 lg:p-12 hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-x divide-border-subtle/50">
            <div className="flex flex-col items-center text-center px-4">
              <Truck size={36} className="text-primary mb-4" />
              <h3 className="text-white font-bold mb-2">Fast Nationwide Delivery</h3>
              <p className="text-sm text-secondary">Same day for Asaba. 1-3 days for other cities.</p>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <ShieldCheck size={36} className="text-primary mb-4" />
              <h3 className="text-white font-bold mb-2">Authentic Warranty</h3>
              <p className="text-sm text-secondary">Manufacturer warranty and our 6-month store guarantee.</p>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <CreditCard size={36} className="text-primary mb-4" />
              <h3 className="text-white font-bold mb-2">Secure Payments</h3>
              <p className="text-sm text-secondary">Pay securely via Paystack, bank transfer, or crypto.</p>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <Clock size={36} className="text-primary mb-4" />
              <h3 className="text-white font-bold mb-2">24/7 Support</h3>
              <p className="text-sm text-secondary">Our WhatsApp concierge is always available to help.</p>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section id="featured">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Featured Deals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product: any, index: number) => (
              <Link href={`/product/${product.id}`} key={product.id} className={index === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
                <BentoProductCard
                  product={product as any}
                  featured={index === 0}
                />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
