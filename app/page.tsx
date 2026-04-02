import { LatestProductsCarousel } from "@/components/ui/LatestProductsCarousel";
import { FeaturedProductsGrid } from "@/components/ui/FeaturedProductsGrid";
import { Reveal } from "@/components/ui/Reveal";
import { RecentlyViewedRail } from "@/components/ui/RecentlyViewedRail";
import { ShieldCheck, Truck, Clock, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { fallbackCategories, fallbackFeaturedProducts } from "@/lib/fallback-data";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { shouldUseDatabase } from "@/lib/should-use-database";

export default async function Home() {
  const [dbProducts, dbCategories] = shouldUseDatabase()
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
          slug: p.slug,
          price: p.price,
          stock: p.stock,
          image: getPrimaryImage(p.images),
          categoryId: p.categoryId,
          brandId: p.brandId ?? undefined,
          technicalSpecs: normalizeTechnicalSpecs(p.technicalSpecs),
        }))
      : fallbackFeaturedProducts;

  return (
    <div className="min-h-screen pb-24">
      <main className="container relative mx-auto overflow-hidden px-4 pt-6 sm:pt-10">
        <section className="relative mb-16 overflow-hidden rounded-[2.4rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] backdrop-blur-2xl sm:p-8 lg:mb-24 lg:p-12">
          <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[var(--brand-tint-primary)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[var(--brand-tint-secondary)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--bg-secondary)_0%,var(--hero-surface)_45%,var(--bg-tertiary)_100%)]" />
          <div
            className="absolute inset-y-0 right-0 w-full bg-cover bg-center bg-no-repeat opacity-65 lg:w-[58%]"
            style={{ backgroundImage: "var(--hero-illustration)" }}
          />
          <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
          <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,var(--hero-surface)_0%,rgba(255,255,255,0.08)_56%,transparent_100%)] lg:w-[64%]" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div className="max-w-2xl rounded-[2rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-secondary),var(--surface-primary))] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-2xl sm:p-7">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-primary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--hero-foreground)] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                  Built for modern shopping in Nigeria
                </p>
                <h1 className="mb-6 max-w-xl text-3xl font-extrabold leading-tight tracking-tight text-[var(--hero-foreground)] sm:text-5xl lg:text-6xl">
                  Tech you can trust, delivered at the speed of your life.
                </h1>
                <p className="mb-8 max-w-xl text-sm leading-relaxed text-[var(--hero-foreground-soft)] sm:text-lg">
                  Curated drops, verified originals, and concierge-level checkout built for Nigeria.
                </p>
                <div className="mb-8 grid max-w-xl grid-cols-3 gap-3">
                  <div className="rounded-[1.35rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-primary),var(--surface-soft))] px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--hero-foreground-soft)]">Brands</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--hero-foreground)]">Apple</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-primary),var(--surface-soft))] px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--hero-foreground-soft)]">Delivery</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--hero-foreground)]">1-3 days</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-primary),var(--surface-soft))] px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--hero-foreground-soft)]">Support</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--hero-foreground)]">Live help</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#featured"
                    className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-8 py-3 text-sm font-semibold text-[var(--primary-contrast)] shadow-[0_18px_40px_rgba(63,107,253,0.28)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:scale-[1.02] hover:bg-[var(--primary-hover)]"
                  >
                    <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)] opacity-0 transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:opacity-100" />
                    Shop Featured
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/category/phones"
                    className="inline-flex items-center justify-center rounded-full border border-[var(--interactive-border)] bg-[var(--surface-primary)] px-8 py-3 text-sm font-semibold text-[var(--hero-foreground)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-hover)]"
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

        <RecentlyViewedRail />

        <Reveal className="mb-16">
          <div className="flex flex-col gap-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Trusted by tech lovers</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">Top brands, curated weekly</h2>
              <p className="mt-2 text-sm text-secondary">Verified originals, fast delivery, and concierge support.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["Apple", "Samsung", "Sony", "Lenovo", "Anker"].map((brand) => (
                <span
                  key={brand}
                  className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--foreground)]"
                >
                  {brand}
                </span>
              ))}
              <Link
                href="/brand/apple"
                className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-secondary transition-colors hover:text-[var(--foreground)]"
              >
                See all
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal className="mb-20 lg:mb-24">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Browse fast</p>
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Shop by Category</h2>
              <p className="text-sm text-secondary">Start with your device type or accessory need.</p>
            </div>
            <Link
              href="/category/phones"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-[var(--foreground)]"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dbCategories.map((category: any) => (
              <Link
                key={category.id}
                href={`/category/${category.id}`}
                className="group relative h-52 overflow-hidden rounded-[32px] border border-[var(--category-card-border)] bg-[var(--category-card-surface)] shadow-[var(--category-card-shadow)] transition duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-1.5 hover:shadow-[var(--category-card-shadow-hover)]"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  quality={90}
                  className="object-cover transition duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[var(--category-card-overlay)]" />
                <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-[var(--category-pill-border)] bg-[var(--category-pill-bg)] p-4 backdrop-blur-md transition duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:border-[var(--category-pill-border-hover)] group-hover:-translate-y-1.5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[var(--category-pill-title)]">{category.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-[var(--category-pill-subtitle)]">Explore collection</p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal className="mb-20 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-6 md:mb-24 md:p-10" delay={0.05}>
          <div className="grid gap-8 md:grid-cols-4 md:gap-6">
            <div className="group text-center transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-1">
              <Truck size={30} className="mx-auto mb-3 text-primary" />
              <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Fast Delivery</h3>
              <p className="text-xs leading-relaxed text-secondary">Same day in Asaba, 1-3 days nationwide.</p>
            </div>
            <div className="group text-center transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-1">
              <ShieldCheck size={30} className="mx-auto mb-3 text-primary" />
              <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Authentic Warranty</h3>
              <p className="text-xs leading-relaxed text-secondary">Manufacturer-backed and store-covered support.</p>
            </div>
            <div className="group text-center transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-1">
              <CreditCard size={30} className="mx-auto mb-3 text-primary" />
              <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">Secure Payments</h3>
              <p className="text-xs leading-relaxed text-secondary">Paystack, transfer, and verified payment flow.</p>
            </div>
            <div className="group text-center transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-1">
              <Clock size={30} className="mx-auto mb-3 text-primary" />
              <h3 className="mb-2 text-sm font-semibold text-[var(--foreground)]">24/7 Help</h3>
              <p className="text-xs leading-relaxed text-secondary">Live WhatsApp concierge whenever you need it.</p>
            </div>
          </div>
        </Reveal>

        <section id="featured">
          <Reveal>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Curated picks</p>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Featured Deals</h2>
                <p className="text-sm text-secondary">Best value gadgets with verified warranty.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Phones", href: "/category/phones" },
                  { label: "Laptops", href: "/category/laptops" },
                  { label: "Audio", href: "/category/audio" },
                  { label: "Compare", href: "/compare" },
                ].map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-[var(--foreground)]"
                  >
                    {chip.label}
                  </Link>
                ))}
              </div>
            </div>
            <FeaturedProductsGrid products={featuredProducts as any} />
          </Reveal>
        </section>
      </main>
    </div>
  );
}

