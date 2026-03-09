import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { StickyBottomCTA } from "@/components/product/StickyBottomCTA";
import { MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { CompareButton } from "@/components/product/CompareButton";
import { Reveal } from "@/components/ui/Reveal";
import { ProductDepthGallery } from "@/components/product/ProductDepthGallery";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  const dbProduct = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: { category: true },
  });

  if (!dbProduct) {
    notFound();
  }

  const images = Array.isArray(dbProduct.images) && dbProduct.images.length > 0 ? dbProduct.images : [""];

  const product = {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    image: images[0],
    categoryId: dbProduct.categoryId,
    brandId: undefined,
    technicalSpecs: dbProduct.technicalSpecs as any,
  };

  const condition = (product.technicalSpecs as any).condition || "New";
  const whatsappMsg = encodeURIComponent(`Hi, I want to buy the ${product.name} for ₦${product.price}`);

  return (
    <div className="min-h-screen bg-base pb-24 lg:pb-12">
      <main className="container mx-auto px-4 pt-8">
        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Reveal>
            <ProductDepthGallery name={product.name} images={images.filter(Boolean)} condition={condition} />
          </Reveal>

          <Reveal delay={0.06} className="flex flex-col">
            <div className="mb-4 inline-flex max-w-max items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              {condition}
            </div>

            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white lg:text-5xl">{product.name}</h1>

            <p className="mb-8 text-3xl font-semibold text-emerald-400">
              {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.price)}
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4">
              <div className="rounded-standard border border-white/10 bg-white/5 p-4 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <Truck className="text-secondary" />
                  <div>
                    <p className="text-sm text-secondary">Delivery</p>
                    <p className="font-medium text-white">1-3 Days</p>
                  </div>
                </div>
              </div>
              <div className="rounded-standard border border-white/10 bg-white/5 p-4 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-secondary" />
                  <div>
                    <p className="text-sm text-secondary">Warranty</p>
                    <p className="font-medium text-white">6 Months</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto hidden gap-4 sm:flex">
              <AddToCartButton product={product} className="flex-1 rounded-standard border border-white/10 bg-white/5 py-4 font-bold text-white outline-none transition-all hover:bg-white/10 focus:ring-2 focus:ring-white/20 active:scale-95" />
              <a
                href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                className="flex flex-1 items-center justify-center gap-2 rounded-standard bg-primary py-4 text-base font-bold text-black transition-all hover:scale-[1.02] hover:bg-emerald-300 active:scale-95"
              >
                <MessageCircle size={20} />
                Buy via WhatsApp
              </a>
              <CompareButton product={product} showLabel className="rounded-standard border border-white/10 bg-white/5 px-6 hover:bg-white/10" />
            </div>
          </Reveal>
        </div>

        <Reveal className="mx-auto mt-16 max-w-4xl">
          <h2 className="mb-8 text-2xl font-bold text-white">Technical Specifications</h2>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-6 shadow-glass backdrop-blur-md">
            <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2">
              {Object.entries(product.technicalSpecs).map(([key, value]) => (
                <div key={key} className="border-b border-white/5 pb-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-widest text-secondary">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="font-medium text-white">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </main>

      <StickyBottomCTA product={product} />
    </div>
  );
}
