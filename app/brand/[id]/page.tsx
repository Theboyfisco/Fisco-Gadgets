import prisma from "@/lib/db";
import { BentoProductCard } from "@/components/product/BentoProductCard";
import Link from "next/link";

export default async function BrandPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const brandId = resolvedParams.id;
  
  const dbProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: brandId, mode: 'insensitive' } },
        { description: { contains: brandId, mode: 'insensitive' } }
      ]
    },
    include: { category: true }
  });

  const products = dbProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    image: p.images[0],
    categoryId: p.categoryId,
    brandId: brandId,
    technicalSpecs: p.technicalSpecs as any
  }));

  const brandName = brandId.charAt(0).toUpperCase() + brandId.slice(1);

  return (
    <div className="container mx-auto px-4 py-16 flex-1">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 inline-block capitalize">
        {brandName} Store
      </h1>
      <p className="text-secondary text-lg mb-12 max-w-2xl">
        Authentic {brandName} devices with full manufacturer warranties, available right here in Nigeria.
      </p>

      {products.length === 0 ? (
        <div className="bg-white/5 border border-border-subtle rounded-standard p-12 text-center">
          <p className="text-secondary text-lg">No products found for this brand.</p>
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
