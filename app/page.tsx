import { BentoProductCard } from "@/components/product/BentoProductCard";
import { LatestProductsCarousel } from "@/components/ui/LatestProductsCarousel";
import { Reveal } from "@/components/ui/Reveal";
import { ShieldCheck, Truck, Clock, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { fallbackCategories, fallbackFeaturedProducts } from "@/lib/fallback-data";

const heroBackdrop =
  "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1920&auto=format&fit=crop";

export default async function Home() {
  const [dbProducts, dbCategories] = process.env.DATABASE_URL
    ? await Promise.all([
        prisma.product
          .findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: { category: true },
          })
          .catch(() => []),
        prisma.category.findMany().catch(() => fallbackCategories),
      ])
    : [[], fallbackCategories];

  const featuredProducts =
    dbProducts.length > 0
      ? dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images[0],
          categoryId: p.categoryId,
          technicalSpecs: p.technicalSpecs as any,
        }))
      : fallbackFeaturedProducts;

  return (
    <div className="min-h-screen pb-24">
      <main className="container relative mx-auto overflow-hidden px-4 pt-6 sm:pt-10">
        <section className="relative mb-16 overflow-hidden rounded-[2rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] sm:p-8 lg:mb-24 lg:p-12">
          <Image src={heroBackdrop} alt="Futuristic gadgets background" fill className="object-cover opacity-45" priority quality={95} />
          <div className="absolute inset-0 bg-[var(--hero-overlay)]" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Built for modern shopping in Nigeria
                </p>
                <h1 className="mb-6 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                  Tech you can trust, delivered at the speed of your life.
                </h1>
                <p className="mb-8 max-w-xl text-sm leading-relaxed text-secondary sm:text-lg">
                  Curated drops, verified originals, and concierge-level checkout built for Nigeria.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#featured"
                    className="inline-flex items-center justify-center gap-2 rounded-standard bg-primary px-8 py-3 text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:bg-emerald-300"
                  >
                    Shop Featured
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/category/phones"
                    className="inline-flex items-center justify-center rounded-standard border border-border-subtle bg-[var(--surface-card)] px-8 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-cta)]"
                  >
                    Browse Phones
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="mx-auto w-full max-w-lg sm:max-w-xl lg:mx-0">
              <LatestProductsCarousel products={featuredProducts} />
            </Reveal>
          </div>
        </section>

        <Reveal className="mb-20 lg:mb-24">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dbCategories.map((category: any) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="group relative h-48 overflow-hidden rounded-[28px] border border-[var(--category-card-border)] bg-[var(--category-card-surface)] shadow-[var(--category-card-shadow)] transition duration-500 hover:-translate-y-1 hover:shadow-[var(--category-card-shadow-hover)]"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  quality={90}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[var(--category-card-overlay)]" />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-[var(--category-pill-border)] bg-[var(--category-pill-bg)] p-4 backdrop-blur-sm transition duration-300 group-hover:border-[var(--category-pill-border-hover)]">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[var(--category-pill-title)]">{category.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[var(--category-pill-subtitle)]">Explore collection</p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal className="mb-20 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-6 md:mb-24 md:p-10" delay={0.05}>
          <div className="grid gap-8 md:grid-cols-4 md:gap-6">
            <div className="text-center">
              <Truck size={30} className="mx-auto mb-3 text-primary" />
              <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Fast Delivery</h3>
              <p className="text-xs leading-relaxed text-secondary">Same day in Asaba, 1-3 days nationwide.</p>
            </div>
            <div className="text-center">
              <ShieldCheck size={30} className="mx-auto mb-3 text-primary" />
              <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Authentic Warranty</h3>
              <p className="text-xs leading-relaxed text-secondary">Manufacturer-backed and store-covered support.</p>
            </div>
            <div className="text-center">
              <CreditCard size={30} className="mx-auto mb-3 text-primary" />
              <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Secure Payments</h3>
              <p className="text-xs leading-relaxed text-secondary">Paystack, transfer, and verified payment flow.</p>
            </div>
            <div className="text-center">
              <Clock size={30} className="mx-auto mb-3 text-primary" />
              <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">24/7 Help</h3>
              <p className="text-xs leading-relaxed text-secondary">Live WhatsApp concierge whenever you need it.</p>
            </div>
          </div>
        </Reveal>

        <section id="featured">
          <Reveal>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Featured Deals</h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product: any, index: number) => (
                <Link href={`/product/${product.id}`} key={product.id} className={index === 0 ? "md:col-span-2 lg:col-span-2" : ""}>
                  <BentoProductCard product={product as any} featured={index === 0} />
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      </main>
    </div>
  );
}
