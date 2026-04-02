import type { Metadata } from "next";
import prisma from "@/lib/db";
import type { Prisma, Condition } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { ProductGridMotion } from "@/components/ui/ProductGridMotion";
import { CategorySort } from "@/components/ui/CategorySort";
import { CategoryFiltersServer } from "@/components/ui/CategoryFiltersServer";
import { fallbackCategories, fallbackFeaturedProducts } from "@/lib/fallback-data";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { SITE_NAME, truncateDescription, toAbsoluteUrl } from "@/lib/site-config";

export const revalidate = 300;

function categoryTone(categoryId: string) {
  if (categoryId === "phones") return "from-[var(--tone-phones)]";
  if (categoryId === "laptops") return "from-[var(--tone-laptops)]";
  if (categoryId === "audio") return "from-[var(--tone-audio)]";
  return "from-[var(--tone-generic)]";
}

function normalizeSpec(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const useDatabase = shouldUseDatabase();

  const category = useDatabase
    ? await prisma.category
        .findFirst({
          where: {
            OR: [{ id }, { slug: id }],
          },
        })
        .catch(() => null)
    : fallbackCategories.find((entry) => entry.id === id || entry.slug === id) ?? null;

  if (!category) {
    return {
      title: `Category Not Found | ${SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = `/category/${category.slug ?? category.id}`;
  const description = truncateDescription(
    `Shop ${category.name} at ${SITE_NAME}. Verified originals, fast delivery, and secure checkout in Nigeria.`,
  );

  return {
    title: `${category.name} Collection`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: `${category.name} Collection | ${SITE_NAME}`,
      description,
      url: toAbsoluteUrl(canonicalPath),
      type: "website",
      images: category.image ? [{ url: category.image }] : undefined,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    sort?: string;
    min?: string;
    max?: string;
    brand?: string;
    condition?: string;
    stock?: string;
    ram?: string;
    storage?: string;
    page?: string;
  }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const categoryParam = resolvedParams.id;
  const sort = resolvedSearchParams?.sort ?? "newest";
  const min = resolvedSearchParams?.min ? Number(resolvedSearchParams.min) : undefined;
  const max = resolvedSearchParams?.max ? Number(resolvedSearchParams.max) : undefined;
  const brand = resolvedSearchParams?.brand ?? "";
  const condition = resolvedSearchParams?.condition ?? "";
  const stock = resolvedSearchParams?.stock ?? "";
  const ramFilter = normalizeSpec(resolvedSearchParams?.ram);
  const storageFilter = normalizeSpec(resolvedSearchParams?.storage);
  const pageParam = Number(resolvedSearchParams?.page || "1");
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
  const PAGE_SIZE = 12;
  const minValue = Number.isFinite(min) ? (min as number) : undefined;
  const maxValue = Number.isFinite(max) ? (max as number) : undefined;
  const validCondition = ["NEW", "OPEN_BOX", "REFURBISHED"].includes(condition) ? (condition as Condition) : undefined;
  const useDatabase = shouldUseDatabase();

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const category = useDatabase
    ? await prisma.category
        .findFirst({
          where: {
            OR: [{ id: categoryParam }, { slug: categoryParam }],
          },
        })
        .catch(() => null)
    : fallbackCategories.find((entry) => entry.id === categoryParam) ?? null;

  if (!category) {
    notFound();
  }

  const dbProducts = useDatabase
    ? await prisma.product
        .findMany({
          where: {
            categoryId: category.id,
            ...(brand ? { brandId: brand } : {}),
            ...(validCondition ? { condition: validCondition } : {}),
            ...(stock === "in"
              ? { stock: { gt: 0 } }
              : stock === "low"
                ? { stock: { gt: 0, lte: 5 } }
                : {}),
            ...(Number.isFinite(minValue) || Number.isFinite(maxValue)
              ? {
                  price: {
                    ...(Number.isFinite(minValue) ? { gte: minValue } : {}),
                    ...(Number.isFinite(maxValue) ? { lte: maxValue } : {}),
                  },
                }
              : {}),
          },
          orderBy,
          include: { category: true, brand: true },
        })
        .catch(() => [])
    : [];

  const rawProducts =
    useDatabase
      ? dbProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          stock: product.stock,
          image: getPrimaryImage(product.images, category.image),
          categoryId: product.categoryId,
          brandId: product.brandId ?? undefined,
          condition: product.condition,
          technicalSpecs: normalizeTechnicalSpecs(product.technicalSpecs),
        }))
      : fallbackFeaturedProducts.filter((product) => product.categoryId === category.id);

  const products = rawProducts.filter((product: any) => {
    if (ramFilter && normalizeSpec(product.technicalSpecs?.ram) !== ramFilter) {
      return false;
    }
    if (storageFilter && normalizeSpec(product.technicalSpecs?.storage) !== storageFilter) {
      return false;
    }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = products.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const brandOptions = Array.from(
    new Map(
      dbProducts
        .filter((item: any) => item.brand?.id && item.brand?.name)
        .map((item: any) => [item.brand.id, { id: item.brand.id, name: item.brand.name }]),
    ).values(),
  );
  const ramOptions = Array.from(
    new Set(rawProducts.map((item: any) => String(item.technicalSpecs?.ram || "").trim()).filter(Boolean)),
  );
  const storageOptions = Array.from(
    new Set(rawProducts.map((item: any) => String(item.technicalSpecs?.storage || "").trim()).filter(Boolean)),
  );

  const heroImage = products[0]?.image || category.image || fallbackFeaturedProducts[0]?.image || "/hero-brand-scene.svg";

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <Reveal className="mb-10">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-contrast)] p-6 sm:p-8 md:p-10">
          <Image src={heroImage} alt={category.name} fill quality={92} className="object-cover opacity-35" priority />
          <div className={`absolute inset-0 bg-gradient-to-r ${categoryTone(category.id)} via-[var(--surface-contrast)] to-[var(--surface-contrast)]`} />
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hero-foreground)] backdrop-blur-md">
              Curated Collection
            </p>
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-[var(--hero-foreground)] drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl">{category.name}</h1>
            <p className="text-sm text-[var(--hero-foreground-soft)] sm:text-base md:text-lg">
              Handpicked premium {category.name.toLowerCase()} with clean specs, trusted warranty, and fast nationwide delivery.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-secondary">{products.length} items</p>
            <CategorySort />
          </div>
          <CategoryFiltersServer
            min={minValue}
            max={maxValue}
            brandOptions={brandOptions}
            ramOptions={ramOptions}
            storageOptions={storageOptions}
          />
        </div>

        {products.length === 0 ? (
          <div className="rounded-[1.75rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-12 text-center shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
            <p className="text-lg text-secondary">No products match your filters.</p>
            <Link href={`/category/${category.slug ?? category.id}`} className="interactive-focus link-accent mt-2 inline-block text-sm">
              Clear filters
            </Link>
          </div>
        ) : (
          <>
            <ProductGridMotion products={paginatedProducts} />
            {totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-between rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                  Page {safePage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/category/${category.slug ?? category.id}?${new URLSearchParams({
                      ...(resolvedSearchParams?.sort ? { sort: resolvedSearchParams.sort } : {}),
                      ...(resolvedSearchParams?.min ? { min: resolvedSearchParams.min } : {}),
                      ...(resolvedSearchParams?.max ? { max: resolvedSearchParams.max } : {}),
                      ...(resolvedSearchParams?.brand ? { brand: resolvedSearchParams.brand } : {}),
                      ...(resolvedSearchParams?.condition ? { condition: resolvedSearchParams.condition } : {}),
                      ...(resolvedSearchParams?.stock ? { stock: resolvedSearchParams.stock } : {}),
                      ...(resolvedSearchParams?.ram ? { ram: resolvedSearchParams.ram } : {}),
                      ...(resolvedSearchParams?.storage ? { storage: resolvedSearchParams.storage } : {}),
                      page: String(Math.max(1, safePage - 1)),
                    }).toString()}`}
                    aria-disabled={safePage <= 1}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                      safePage <= 1
                        ? "pointer-events-none border-[var(--border-subtle)] text-[var(--text-soft)]"
                        : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                    }`}
                  >
                    Previous
                  </Link>
                  <Link
                    href={`/category/${category.slug ?? category.id}?${new URLSearchParams({
                      ...(resolvedSearchParams?.sort ? { sort: resolvedSearchParams.sort } : {}),
                      ...(resolvedSearchParams?.min ? { min: resolvedSearchParams.min } : {}),
                      ...(resolvedSearchParams?.max ? { max: resolvedSearchParams.max } : {}),
                      ...(resolvedSearchParams?.brand ? { brand: resolvedSearchParams.brand } : {}),
                      ...(resolvedSearchParams?.condition ? { condition: resolvedSearchParams.condition } : {}),
                      ...(resolvedSearchParams?.stock ? { stock: resolvedSearchParams.stock } : {}),
                      ...(resolvedSearchParams?.ram ? { ram: resolvedSearchParams.ram } : {}),
                      ...(resolvedSearchParams?.storage ? { storage: resolvedSearchParams.storage } : {}),
                      page: String(Math.min(totalPages, safePage + 1)),
                    }).toString()}`}
                    aria-disabled={safePage >= totalPages}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                      safePage >= totalPages
                        ? "pointer-events-none border-[var(--border-subtle)] text-[var(--text-soft)]"
                        : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                    }`}
                  >
                    Next
                  </Link>
                </div>
              </div>
            ) : null}
          </>
        )}
      </Reveal>
    </div>
  );
}
