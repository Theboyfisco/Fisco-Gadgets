import type { Metadata } from "next";
import { LatestProductsCarousel } from "@/components/ui/LatestProductsCarousel";
import { FeaturedProductsGrid } from "@/components/ui/FeaturedProductsGrid";
import { Reveal } from "@/components/ui/Reveal";
import { RecentlyViewedRail } from "@/components/ui/RecentlyViewedRail";
import { ShieldCheck, Truck, Clock, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import prisma from "@/lib/db";
import { fallbackCategories, fallbackFeaturedProducts } from "@/lib/fallback-data";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { SITE_NAME, truncateDescription, toAbsoluteUrl } from "@/lib/site-config";

export const revalidate = 300;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]);
}

export async function generateMetadata(): Promise<Metadata> {
  const useDatabase = shouldUseDatabase();
  if (!useDatabase) {
    return {
      title: `${SITE_NAME} — Premium Tech Store`,
      description: "Premium Apple, Samsung, and high-end tech accessories in Nigeria.",
      alternates: { canonical: "/" },
    };
  }

  const [productCount, categoryCount] = await withTimeout(
    Promise.all([prisma.product.count().catch(() => 0), prisma.category.count().catch(() => 0)]),
    1400,
    [0, 0] as const,
  );

  const description = truncateDescription(
    `Shop ${productCount || "premium"} gadgets across ${categoryCount || "multiple"} curated categories with concierge checkout and nationwide delivery in Nigeria.`,
  );

  return {
    title: `${SITE_NAME} — Premium Tech Store`,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title: `${SITE_NAME} — Premium Tech Store`,
      description,
      url: toAbsoluteUrl("/"),
      type: "website",
    },
  };
}

export default async function Home() {
  const fallbackHomeData = [[], fallbackCategories] as const;
  const [dbProducts, dbCategories] = shouldUseDatabase()
    ? await withTimeout(
        Promise.all([
          prisma.product
            .findMany({
              take: 10,
              orderBy: { createdAt: "desc" },
              include: { category: true },
            })
            .catch(() => []),
          prisma.category.findMany().catch(() => fallbackCategories),
        ]),
        1800,
        fallbackHomeData,
      )
    : fallbackHomeData;

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
    <div className="min-h-screen pb-[clamp(4rem,8vw,6.5rem)]">
      <main className="container relative mx-auto overflow-hidden pt-[clamp(1.1rem,3.2vw,3.5rem)]">
        <section className="relative mb-[var(--section-gap)] mt-1 overflow-hidden rounded-[clamp(1.45rem,3vw,2.6rem)] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-[clamp(0.85rem,2.2vw,2.8rem)] shadow-[var(--hero-shadow)] backdrop-blur-2xl sm:mt-2">
          <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[var(--brand-tint-primary)] blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[var(--brand-tint-secondary)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--bg-secondary)_0%,var(--hero-surface)_45%,var(--bg-tertiary)_100%)]" />
          <div
            className="absolute inset-y-0 right-0 w-full bg-cover bg-center bg-no-repeat opacity-65 lg:w-[58%]"
            style={{ backgroundImage: "var(--hero-illustration)" }}
          />
          <div className="absolute inset-0 bg-[var(--hero-overlay)]" />
          <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,var(--hero-surface)_0%,rgba(255,255,255,0.08)_56%,transparent_100%)] lg:w-[64%]" />

          <div className="relative z-10 grid items-center gap-[clamp(1.25rem,3vw,3rem)] xl:grid-cols-2">
            <Reveal className="order-2 xl:order-1">
              <div className="max-w-[58rem] rounded-[clamp(1.2rem,2vw,2rem)] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-secondary),var(--surface-primary))] p-[clamp(0.9rem,1.8vw,1.8rem)] shadow-[0_24px_80px_rgba(var(--shadow-neutral-rgb),0.1)] backdrop-blur-2xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-primary)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--hero-foreground)] shadow-[0_10px_30px_rgba(var(--shadow-neutral-rgb),0.08)] sm:mb-5 sm:text-xs sm:tracking-[0.16em]">
                  Built for modern shopping in Nigeria
                </p>
                <h1 className="mb-5 max-w-3xl text-[clamp(2rem,8.3vw,4.9rem)] font-extrabold leading-[1.03] tracking-tight text-[var(--hero-foreground)] sm:mb-6">
                  Tech you can trust, delivered at the speed of your life.
                </h1>
                <p className="mb-6 max-w-2xl text-[clamp(0.95rem,1.5vw,1.22rem)] leading-relaxed text-[var(--hero-foreground-soft)] sm:mb-8">
                  Curated drops, verified originals, and concierge-level checkout built for Nigeria.
                </p>
                <div className="mb-6 grid max-w-2xl grid-cols-1 gap-2.5 sm:mb-8 sm:grid-cols-3 sm:gap-3">
                  <div className="rounded-[1.35rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-primary),var(--surface-soft))] px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--hero-foreground-soft)]">Brands</p>
                    <p className="mt-2 text-[clamp(1rem,2vw,1.2rem)] font-semibold text-[var(--hero-foreground)]">Apple</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-primary),var(--surface-soft))] px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--hero-foreground-soft)]">Delivery</p>
                    <p className="mt-2 text-[clamp(1rem,2vw,1.2rem)] font-semibold text-[var(--hero-foreground)]">1-3 days</p>
                  </div>
                  <div className="rounded-[1.35rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-primary),var(--surface-soft))] px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--hero-foreground-soft)]">Support</p>
                    <p className="mt-2 text-[clamp(1rem,2vw,1.2rem)] font-semibold text-[var(--hero-foreground)]">Live help</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="#featured"
                    className="relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-8 py-3 text-sm font-semibold text-[var(--primary-contrast)] shadow-[0_18px_40px_rgba(var(--shadow-brand-rgb),0.28)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:scale-[1.02] hover:bg-[var(--primary-hover)] sm:w-auto"
                  >
                    <span className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)] opacity-0 transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:opacity-100" />
                    Shop Featured
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/category/phones"
                    className="inline-flex w-full items-center justify-center rounded-full border border-[var(--interactive-border)] bg-[var(--surface-primary)] px-8 py-3 text-sm font-semibold text-[var(--hero-foreground)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-hover)] sm:w-auto"
                  >
                    Browse Phones
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="order-1 mx-auto w-full max-w-[min(100%,44rem)] xl:order-2 xl:mx-0">
              <LatestProductsCarousel products={featuredProducts} />
            </Reveal>
          </div>
        </section>

        <RecentlyViewedRail />

        <Reveal className="mb-[clamp(3rem,5vw,5rem)]">
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

        <Reveal className="mb-[var(--section-gap)]">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dbCategories.map((category: any) => (
              <Link
                key={category.id}
                href={`/category/${category.slug ?? category.id}`}
                className="group relative h-[clamp(12.8rem,20vw,15.6rem)] overflow-hidden rounded-[clamp(1.3rem,2.2vw,2rem)] border border-[var(--category-card-border)] bg-[var(--category-card-surface)] shadow-[var(--category-card-shadow)] transition duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-1.5 hover:shadow-[var(--category-card-shadow-hover)]"
              >
                <SafeImage
                  src={category.image ?? ""}
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

        <Reveal className="mb-[var(--section-gap)] rounded-[clamp(1.25rem,2.5vw,2rem)] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-[clamp(1rem,2.2vw,2.4rem)]" delay={0.05}>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
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



