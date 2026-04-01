import prisma from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { ProductGridMotion } from "@/components/ui/ProductGridMotion";
import Image from "next/image";
import { fallbackFeaturedProducts } from "@/lib/fallback-data";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { shouldUseDatabase } from "@/lib/should-use-database";

function brandTone(brandId: string) {
  if (brandId.toLowerCase() === "apple") return "from-[var(--tone-apple)]";
  if (brandId.toLowerCase() === "samsung") return "from-[var(--tone-samsung)]";
  return "from-[var(--tone-brand)]";
}

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const brandId = resolvedParams.id;

  const dbProducts = shouldUseDatabase()
    ? await prisma.product
        .findMany({
          where: {
            OR: [
              { name: { contains: brandId, mode: "insensitive" } },
              { description: { contains: brandId, mode: "insensitive" } },
            ],
          },
          include: { category: true },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => [])
    : [];

  const products =
    dbProducts.length > 0
      ? dbProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: getPrimaryImage(product.images),
          categoryId: product.categoryId,
          brandId,
          technicalSpecs: normalizeTechnicalSpecs(product.technicalSpecs),
        }))
      : fallbackFeaturedProducts
          .filter((product) => product.name.toLowerCase().includes(brandId.toLowerCase()))
          .map((product) => ({ ...product, brandId }));

  const brandName = brandId.charAt(0).toUpperCase() + brandId.slice(1);
  const heroImage = products[0]?.image || "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=1400&auto=format&fit=crop";

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <Reveal className="mb-10">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-contrast)] p-6 sm:p-8 md:p-10">
          <Image src={heroImage} alt={`${brandName} showcase`} fill quality={92} className="object-cover opacity-35" priority />
          <div className={`absolute inset-0 bg-gradient-to-r ${brandTone(brandId)} via-[var(--surface-contrast)] to-[var(--surface-contrast)]`} />
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--hero-foreground)] backdrop-blur-md">
              Official Collection
            </p>
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-[var(--hero-foreground)] capitalize drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:text-4xl md:text-5xl">{brandName} Store</h1>
            <p className="text-sm text-[var(--hero-foreground-soft)] sm:text-base md:text-lg">
              Authentic {brandName} devices with verified warranty, tailored bundles, and fast delivery across Nigeria.
            </p>
          </div>
        </div>
      </Reveal>

      {products.length === 0 ? (
        <div className="rounded-[1.75rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-12 text-center shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
          <p className="text-lg text-secondary">No products found for this brand.</p>
        </div>
      ) : (
        <Reveal>
          <ProductGridMotion products={products} />
        </Reveal>
      )}
    </div>
  );
}
