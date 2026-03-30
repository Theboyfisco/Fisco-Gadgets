import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BentoProductCard } from "@/components/product/BentoProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { CategorySort } from "@/components/ui/CategorySort";
import { CategoryFilters } from "@/components/ui/CategoryFilters";

function categoryTone(categoryId: string) {
  if (categoryId === "phones") return "from-[var(--tone-phones)]";
  if (categoryId === "laptops") return "from-[var(--tone-laptops)]";
  if (categoryId === "audio") return "from-[var(--tone-audio)]";
  return "from-[var(--tone-generic)]";
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { sort?: string };
}) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  const sort = searchParams?.sort ?? "newest";
  const min = searchParams?.min ? Number(searchParams.min) : undefined;
  const max = searchParams?.max ? Number(searchParams.max) : undefined;

  const orderBy =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [category, dbProducts] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId } }),
    prisma.product.findMany({
      where: {
        categoryId,
        ...(Number.isFinite(min) || Number.isFinite(max)
          ? {
              price: {
                ...(Number.isFinite(min) ? { gte: min } : {}),
                ...(Number.isFinite(max) ? { lte: max } : {}),
              },
            }
          : {}),
      },
      orderBy,
      include: { category: true },
    }),
  ]);

  if (!category) {
    notFound();
  }

  const products = dbProducts.map((product: any) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    categoryId: product.categoryId,
    technicalSpecs: product.technicalSpecs as any,
  }));

  const heroImage = products[0]?.image || category.image;

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

      {products.length === 0 ? (
        <div className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-12 text-center">
          <p className="text-lg text-secondary">No products found in this category.</p>
        </div>
      ) : (
        <Reveal>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <p className="text-sm text-secondary">{products.length} items</p>
              <CategorySort />
            </div>
            <CategoryFilters />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product: any) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <BentoProductCard product={product} />
              </Link>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
