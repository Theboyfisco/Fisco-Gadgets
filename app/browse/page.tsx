import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { ProductGridMotion } from "@/components/ui/ProductGridMotion";
import { Reveal } from "@/components/ui/Reveal";
import { fallbackCategories, fallbackFeaturedProducts } from "@/lib/fallback-data";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { SITE_NAME, truncateDescription } from "@/lib/site-config";

type BrowseParams = {
  category?: string;
  brand?: string;
  sort?: string;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "stock_desc", label: "In Stock First" },
] as const;

function buildHref(params: BrowseParams) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.brand) query.set("brand", params.brand);
  if (params.sort && params.sort !== "newest") query.set("sort", params.sort);
  const serialized = query.toString();
  return serialized ? `/browse?${serialized}` : "/browse";
}

function normalizeSort(sort?: string) {
  if (SORT_OPTIONS.some((option) => option.value === sort)) {
    return sort as (typeof SORT_OPTIONS)[number]["value"];
  }
  return "newest";
}

function labelFromSlug(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<BrowseParams>;
}): Promise<Metadata> {
  const resolved = searchParams ? await searchParams : {};
  const category = resolved.category?.trim();
  const brand = resolved.brand?.trim();
  const scope = category ? `${labelFromSlug(category)} devices` : brand ? `${labelFromSlug(brand)} products` : "all products";
  return {
    title: `Browse ${scope}`,
    description: truncateDescription(`Explore ${scope} on ${SITE_NAME} with curated filters and fast product discovery.`),
    alternates: {
      canonical: buildHref({
        category,
        brand,
        sort: normalizeSort(resolved.sort),
      }),
    },
  };
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams?: Promise<BrowseParams>;
}) {
  const resolved = searchParams ? await searchParams : {};
  const activeCategory = resolved.category?.trim() || "";
  const activeBrand = resolved.brand?.trim() || "";
  const sort = normalizeSort(resolved.sort);

  const useDatabase = shouldUseDatabase();

  const fallbackBrands = Array.from(
    new Set(
      fallbackFeaturedProducts
        .map((item) => item.brandId)
        .filter((item): item is string => Boolean(item)),
    ),
  ).map((slug) => ({ id: slug, slug, name: labelFromSlug(slug) }));

  const [categories, brands, productsRaw] = useDatabase
    ? await Promise.all([
        prisma.category.findMany({
          select: { id: true, slug: true, name: true },
          orderBy: { name: "asc" },
        }),
        prisma.brand.findMany({
          select: { id: true, slug: true, name: true },
          orderBy: { name: "asc" },
        }),
        prisma.product.findMany({
          where: {
            ...(activeCategory
              ? {
                  category: {
                    OR: [
                      { slug: { equals: activeCategory, mode: "insensitive" } },
                      { id: { equals: activeCategory, mode: "insensitive" } },
                    ],
                  },
                }
              : {}),
            ...(activeBrand
              ? {
                  brand: {
                    OR: [
                      { slug: { equals: activeBrand, mode: "insensitive" } },
                      { id: { equals: activeBrand, mode: "insensitive" } },
                    ],
                  },
                }
              : {}),
          },
          include: {
            category: { select: { name: true, slug: true } },
            brand: { select: { name: true, slug: true } },
          },
          orderBy:
            sort === "price_asc"
              ? { price: "asc" }
              : sort === "price_desc"
                ? { price: "desc" }
                : sort === "stock_desc"
                  ? [{ stock: "desc" }, { updatedAt: "desc" }]
                  : { updatedAt: "desc" },
          take: 72,
        }),
      ])
    : [
        fallbackCategories.map((item) => ({
          id: item.id,
          slug: item.slug ?? item.id,
          name: item.name,
        })),
        fallbackBrands,
        fallbackFeaturedProducts
          .filter((item) => !activeCategory || item.categoryId.toLowerCase() === activeCategory.toLowerCase())
          .filter((item) => !activeBrand || (item.brandId ?? "").toLowerCase() === activeBrand.toLowerCase())
          .map((item, index) => ({
            id: item.id,
            name: item.name,
            slug: item.slug ?? item.id,
            description: "",
            price: item.price,
            stock: item.stock ?? 0,
            technicalSpecs: item.technicalSpecs,
            images: [item.image],
            categoryId: item.categoryId,
            brandId: item.brandId ?? null,
            category: {
              name: fallbackCategories.find((category) => category.id === item.categoryId)?.name ?? labelFromSlug(item.categoryId),
              slug: item.categoryId,
            },
            brand: item.brandId ? { name: labelFromSlug(item.brandId), slug: item.brandId } : null,
            updatedAt: new Date(Date.UTC(2024, 0, index + 1)),
          })),
      ];

  const products = productsRaw.map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    stock: item.stock,
    image: getPrimaryImage(item.images),
    categoryId: item.category?.slug ?? item.categoryId,
    brandId: item.brand?.slug ?? item.brandId ?? undefined,
    technicalSpecs: normalizeTechnicalSpecs(item.technicalSpecs),
  }));

  const hasFilters = Boolean(activeCategory || activeBrand || sort !== "newest");

  return (
    <div className="min-h-screen pb-16">
      <main className="container mx-auto px-4 py-6 sm:py-8 xl:py-10">
        <Reveal className="mb-6">
          <section className="overflow-hidden rounded-[1.6rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-4 shadow-[var(--hero-shadow)] sm:rounded-[2rem] sm:p-6 xl:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Browse Catalog</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--hero-foreground)] sm:text-4xl">
              Discover products by category, brand, and value.
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-[var(--hero-foreground-soft)] sm:text-base">
              This page is your full catalog control center: filter quickly, compare pricing, and jump straight to the exact gadget you need.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-soft)]">Products</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{products.length}</p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-soft)]">Categories</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{categories.length}</p>
              </div>
              <div className="rounded-[1.2rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-soft)]">Brands</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{brands.length}</p>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal className="mb-6">
          <section className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Categories</p>
                <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto pb-1 pl-1 no-scrollbar md:mx-0 md:flex-wrap md:overflow-visible md:pb-0 md:pl-0">
                  <Link
                    href={buildHref({ brand: activeBrand || undefined, sort })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                      !activeCategory
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                    }`}
                  >
                    All
                  </Link>
                  {categories.map((category) => {
                    const selected = activeCategory.toLowerCase() === (category.slug ?? category.id).toLowerCase();
                    return (
                      <Link
                        key={category.id}
                        href={buildHref({
                          category: category.slug ?? category.id,
                          brand: activeBrand || undefined,
                          sort,
                        })}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                          selected
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                        }`}
                      >
                        {category.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Brands</p>
                <div className="mt-2 -mx-1 flex max-w-full gap-2 overflow-x-auto pb-1 pl-1 no-scrollbar md:mx-0 md:flex-wrap md:overflow-visible md:pb-0 md:pl-0">
                  <Link
                    href={buildHref({ category: activeCategory || undefined, sort })}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                      !activeBrand
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                    }`}
                  >
                    All
                  </Link>
                  {brands.slice(0, 12).map((brand) => {
                    const selected = activeBrand.toLowerCase() === (brand.slug ?? brand.id).toLowerCase();
                    return (
                      <Link
                        key={brand.id}
                        href={buildHref({
                          category: activeCategory || undefined,
                          brand: brand.slug ?? brand.id,
                          sort,
                        })}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                          selected
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                        }`}
                      >
                        {brand.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                Sort:
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1 no-scrollbar sm:flex-wrap sm:overflow-visible sm:pb-0">
                  {SORT_OPTIONS.map((option) => {
                    const selected = option.value === sort;
                    return (
                      <Link
                        key={option.value}
                        href={buildHref({
                          category: activeCategory || undefined,
                          brand: activeBrand || undefined,
                          sort: option.value,
                        })}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                          selected
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                        }`}
                      >
                        {option.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
              {hasFilters ? (
                <Link
                  href="/browse"
                  className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          </section>
        </Reveal>

        {products.length === 0 ? (
          <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-8 text-center">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">No products match this filter</h2>
            <p className="mt-2 text-sm text-secondary">Try a different category, brand, or sort option.</p>
            <Link
              href="/browse"
              className="mt-4 inline-flex rounded-full border border-[var(--border-subtle)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-[var(--foreground)]"
            >
              Reset browse view
            </Link>
          </div>
        ) : (
          <ProductGridMotion products={products} />
        )}
      </main>
    </div>
  );
}
