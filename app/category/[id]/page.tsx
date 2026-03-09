import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BentoProductCard } from "@/components/product/BentoProductCard";
import { Reveal } from "@/components/ui/Reveal";

function categoryTone(categoryId: string) {
  if (categoryId === "phones") return "from-cyan-500/45";
  if (categoryId === "laptops") return "from-indigo-500/45";
  if (categoryId === "audio") return "from-orange-500/45";
  return "from-emerald-500/45";
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;

  const [category, dbProducts] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId } }),
    prisma.product.findMany({
      where: { categoryId },
      orderBy: { createdAt: "desc" },
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
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-8 md:p-10">
          <Image src={heroImage} alt={category.name} fill quality={92} className="object-cover opacity-35" priority />
          <div className={`absolute inset-0 bg-gradient-to-r ${categoryTone(category.id)} via-black/50 to-black/85`} />
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
              Curated Collection
            </p>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl">{category.name}</h1>
            <p className="text-base text-secondary md:text-lg">
              Handpicked premium {category.name.toLowerCase()} with clean specs, trusted warranty, and fast nationwide delivery.
            </p>
          </div>
        </div>
      </Reveal>

      {products.length === 0 ? (
        <div className="rounded-standard border border-border-subtle bg-white/5 p-12 text-center">
          <p className="text-lg text-secondary">No products found in this category.</p>
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
