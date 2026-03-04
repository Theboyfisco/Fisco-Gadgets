"use client";

import { useCompare } from "@/components/product/CompareProvider";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, ShoppingCart, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";

export default function ComparePage() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();

    const specs = Array.from(new Set(
        compareItems.flatMap(item => Object.keys(item.technicalSpecs))
    ));

    if (compareItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <div className="flex justify-center mb-8 text-white/20">
                    <ShoppingCart size={80} />
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-4">Comparison List is Empty</h1>
                <p className="text-secondary mb-12">Add some products to see them compared side-by-side.</p>
                <Link href="/" className="bg-primary hover:bg-emerald-400 text-base px-8 py-4 rounded-xl font-bold transition-all shadow-glow">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-16 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-white mb-4 transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Compare Products</h1>
                </div>
                <button
                    onClick={clearCompare}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors py-2 px-4 rounded-lg bg-red-400/10 border border-red-400/20 w-fit"
                >
                    <Trash2 size={18} />
                    Clear List
                </button>
            </div>

            <div className="overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="inline-flex min-w-full gap-6">
                    {/* Comparison Grid */}
                    <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${compareItems.length}, minmax(280px, 1fr))` }}>
                        {compareItems.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-surface/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-glass h-fit"
                            >
                                <div className="relative h-48 sm:h-64 w-full">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={() => removeFromCompare(product.id)}
                                        className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white rounded-full p-2 hover:bg-red-500 transition-colors z-10"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 h-14">
                                        {product.name}
                                    </h3>
                                    <p className="text-2xl font-black text-primary mb-6">
                                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.price)}
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        {specs.map((spec) => (
                                            <div key={spec} className="border-b border-white/5 pb-3">
                                                <p className="text-[10px] uppercase tracking-widest text-secondary mb-1 font-bold">
                                                    {spec.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-white text-sm font-medium">
                                                    {String(product.technicalSpecs[spec] || "-")}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="w-full bg-white/5 hover:bg-white/10 text-white rounded-xl py-3 text-sm font-bold border border-white/10 transition-all active:scale-95"
                                        >
                                            Add to Cart
                                        </button>
                                        <a
                                            href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hi, I'm comparing products and I'm interested in the ${product.name}`)}`}
                                            className="w-full bg-primary/10 hover:bg-primary/20 text-primary rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all border border-primary/20"
                                        >
                                            <MessageCircle size={16} />
                                            Enquire
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {compareItems.length < 4 && (
                <div className="mt-12 p-8 border-2 border-dashed border-white/5 rounded-2xl text-center">
                    <p className="text-secondary">You can add {4 - compareItems.length} more products to compare.</p>
                </div>
            )}
        </div>
    );
}
