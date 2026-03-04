import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BentoProductCard } from "@/components/product/BentoProductCard";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  
  const [category, dbProducts] = await Promise.all([
      prisma.category.findUnique({ where: { id: categoryId } }),
      prisma.product.findMany({ 
          where: { categoryId: categoryId },
          orderBy: { createdAt: 'desc' },
          include: { category: true }
      })
  ]);

  if (!category) {
      notFound();
  }

  const products = dbProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images[0],
    categoryId: p.categoryId,
    technicalSpecs: p.technicalSpecs as any
  }));

  return (
    <div className="container mx-auto px-4 py-16 flex-1">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 inline-block">
        {category.name}
      </h1>
      <p className="text-secondary text-lg mb-12 max-w-2xl">
        Explore our curated collection of premium {category.name.toLowerCase()} tailored for your lifestyle.
      </p>

      {products.length === 0 ? (
        <div className="bg-white/5 border border-border-subtle rounded-standard p-12 text-center">
          <p className="text-secondary text-lg">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Link href={`/product/${product.id}`} key={product.id}>
              <BentoProductCard product={product} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
