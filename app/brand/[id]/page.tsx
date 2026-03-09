import prisma from "@/lib/db";
import { BentoProductCard } from "@/components/product/BentoProductCard";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import Image from "next/image";

function brandTone(brandId: string) {
  if (brandId.toLowerCase() === "apple") return "from-zinc-200/25";
  if (brandId.toLowerCase() === "samsung") return "from-blue-500/35";
  return "from-emerald-500/35";
}

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const brandId = resolvedParams.id;

  const dbProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: brandId, mode: "insensitive" } },
        { description: { contains: brandId, mode: "insensitive" } },
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.map((product: any) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    categoryId: product.categoryId,
    brandId,
    technicalSpecs: product.technicalSpecs as any,
  }));

  const brandName = brandId.charAt(0).toUpperCase() + brandId.slice(1);
  const heroImage = products[0]?.image || "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=1400&auto=format&fit=crop";

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <Reveal className="mb-10">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-contrast)] p-8 md:p-10">
          <Image src={heroImage} alt={`${brandName} showcase`} fill quality={92} className="object-cover opacity-35" priority />
          <div className={`absolute inset-0 bg-gradient-to-r ${brandTone(brandId)} via-[var(--surface-contrast)] to-[var(--surface-contrast)]`} />
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground)]">
              Official Collection
            </p>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[var(--foreground)] capitalize md:text-5xl">{brandName} Store</h1>
            <p className="text-base text-secondary md:text-lg">
              Authentic {brandName} devices with verified warranty, tailored bundles, and fast delivery across Nigeria.
            </p>
          </div>
        </div>
      </Reveal>

      {products.length === 0 ? (
        <div className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-12 text-center">
          <p className="text-lg text-secondary">No products found for this brand.</p>
        </div>
      ) : (
        <Reveal>
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
