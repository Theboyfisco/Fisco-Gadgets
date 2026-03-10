import { BentoProductCard } from "@/components/product/BentoProductCard";
import { Tilt3D } from "@/components/ui/Tilt3D";
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

  const leadProduct = featuredProducts[0] ?? fallbackFeaturedProducts[0];

  return (
    <div className="min-h-screen pb-24">
      <main className="container relative mx-auto overflow-hidden px-4 pt-8 sm:pt-12">
        <section className="relative mb-20 overflow-hidden rounded-[2rem] border border-white/15 bg-black/30 p-8 shadow-[0_30px_80px_rgba(8,14,30,0.65)] lg:mb-24 lg:p-12">
          <Image src={heroBackdrop} alt="Futuristic gadgets background" fill className="object-cover opacity-45" priority quality={95} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_35%),radial-gradient(circle_at_80%_25%,rgba(16,185,129,0.25),transparent_35%),linear-gradient(to_bottom,rgba(5,8,16,0.2),rgba(5,8,16,0.85))]" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div>
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Built for modern shopping in Nigeria
                </p>
                <h1 className="mb-6 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-6xl">
                  Clean tech shopping with real-time stock and instant checkout.
                </h1>
                <p className="mb-8 max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
                  Discover authentic devices, compare specs quickly, and order in minutes with fast nationwide delivery.
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

            <Reveal delay={0.1} className="mx-auto hidden w-full max-w-xl lg:block">
              <Tilt3D maxTilt={7} spotlightOpacity={0.38}>
                <div className="relative h-[29rem] overflow-hidden rounded-[1.8rem] border border-[var(--border-subtle)] bg-gradient-to-b from-[var(--surface-cta)] to-[var(--surface-soft)] p-6 shadow-2xl">
                  <div className="absolute left-5 top-5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary [transform:translateZ(40px)]">
                    New Arrival
                  </div>
                  <div className="relative h-full w-full [transform-style:preserve-3d]">
                    <Image
                      src={leadProduct?.image || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop"}
                      alt={leadProduct?.name || "Featured Product"}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      quality={95}
                      priority
                      className="object-contain p-10 [transform:translateZ(48px)_scale(1.04)]"
                    />
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-contrast)] p-5 backdrop-blur-md [transform:translateZ(55px)]">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">Recommended today</p>
                    <h4 className="text-lg font-bold text-[var(--foreground)]">{leadProduct?.name || "New Arrival"}</h4>
                    <p className="text-base font-semibold text-primary">
                      {leadProduct
                        ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(leadProduct.price)
                        : "Coming Soon"}
                    </p>
                  </div>
                </div>
              </Tilt3D>
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
                className="group relative h-48 overflow-hidden rounded-[28px] border border-white/10 bg-black/30 shadow-[0_20px_60px_rgba(3,7,18,0.4)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  quality={90}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition duration-300 group-hover:border-white/40">
                  <p className="text-sm font-semibold uppercase tracking-wide text-white">{category.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/70">Explore collection</p>
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
