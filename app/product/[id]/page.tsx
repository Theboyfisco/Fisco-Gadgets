import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { StickyBottomCTA } from "@/components/product/StickyBottomCTA";
import { MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { CompareButton } from "@/components/product/CompareButton";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    
    const dbProduct = await prisma.product.findUnique({
        where: { id: resolvedParams.id },
        include: { category: true }
    });

    if (!dbProduct) {
        notFound();
    }

    // Map DB product to frontend Product type
    const product = {
        id: dbProduct.id,
        name: dbProduct.name,
        price: dbProduct.price,
        image: dbProduct.images[0],
        categoryId: dbProduct.categoryId,
        brandId: undefined, // Optional brand
        technicalSpecs: dbProduct.technicalSpecs as any
    };



    const whatsappMsg = encodeURIComponent(`Hi, I want to buy the ${product.name} for ₦${product.price}`);

    return (
        <div className="min-h-screen pb-24 lg:pb-12 bg-base">
            <main className="container mx-auto px-4 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="relative h-[400px] lg:h-[600px] w-full rounded-2xl overflow-hidden bg-white/5 border border-border-subtle">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                            priority
                        />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <div className="inline-flex max-w-max items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            {(product.technicalSpecs as any).condition || "New"}
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                            {product.name}
                        </h1>

                        <p className="text-3xl font-semibold text-emerald-400 mb-8">
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.price)}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 p-4 rounded-standard bg-white/5 border border-white/5">
                                <Truck className="text-secondary" />
                                <div>
                                    <p className="text-sm text-secondary">Delivery</p>
                                    <p className="text-white font-medium">1-3 Days</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-standard bg-white/5 border border-white/5">
                                <ShieldCheck className="text-secondary" />
                                <div>
                                    <p className="text-sm text-secondary">Warranty</p>
                                    <p className="text-white font-medium">6 Months</p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:flex gap-4 mt-auto">
                            <AddToCartButton product={product} className="flex-1 bg-white/5 hover:bg-white/10 text-white rounded-standard py-4 font-bold active:scale-95 transition-all outline-none focus:ring-2 focus:ring-white/20 border border-white/10" />
                            <a
                                href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                                className="flex-1 bg-primary hover:bg-emerald-400 text-base rounded-standard py-4 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-glow"
                            >
                                <MessageCircle size={20} />
                                Buy via WhatsApp
                            </a>
                            <CompareButton product={product} showLabel className="bg-white/5 hover:bg-white/10 px-6 rounded-standard border border-white/10" />
                        </div>
                    </div>
                </div>

                {/* Specs Section */}
                <section className="mt-16 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-8">Technical Specifications</h2>
                    <div className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden p-6 shadow-glass">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            {Object.entries(product.technicalSpecs).map(([key, value]) => (
                                <div key={key} className="border-b border-white/5 pb-4">
                                    <p className="text-xs uppercase tracking-widest text-secondary mb-1 font-bold">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-white font-medium">{String(value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <StickyBottomCTA product={product} />
        </div>
    );
}
