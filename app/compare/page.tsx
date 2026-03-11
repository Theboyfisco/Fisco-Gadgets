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
                <div className="mb-8 flex justify-center text-secondary/40">
                    <ShoppingCart size={80} />
                </div>
                <h1 className="mb-4 text-4xl font-extrabold text-[var(--foreground)]">Comparison List is Empty</h1>
                <p className="text-secondary mb-12">Add some products to see them compared side-by-side.</p>
                <Link href="/" className="bg-primary text-black hover:bg-emerald-400 text-base px-8 py-4 rounded-xl font-bold transition-all shadow-glow">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-16 flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <Link href="/" className="group mb-4 inline-flex items-center gap-2 text-secondary transition-colors hover:text-[var(--foreground)]">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight text-[var(--foreground)] md:text-5xl">Compare Products</h1>
                </div>
                <button
                    onClick={clearCompare}
                    className="flex items-center gap-2 text-error hover:text-error/80 transition-colors py-2 px-4 rounded-lg bg-error/10 border border-error/20 w-fit"
                >
                    <Trash2 size={18} />
                    Clear List
                </button>
            </div>

            <div className="custom-scrollbar -mx-4 overflow-x-auto pb-8 px-4 scrollbar-thin scrollbar-track-transparent sm:mx-0 sm:px-0">
                <div className="inline-flex min-w-full gap-6">
                    {/* Comparison Grid */}
                    <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${compareItems.length}, minmax(280px, 1fr))` }}>
                        {compareItems.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-fit overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-surface/50 shadow-glass backdrop-blur-md"
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
                                        className="absolute right-4 top-4 z-10 rounded-full bg-[var(--surface-contrast)] p-2 text-[var(--foreground)] backdrop-blur-md transition-colors hover:bg-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="p-6">
                                    <h3 className="mb-2 h-14 line-clamp-2 text-xl font-bold text-[var(--foreground)]">
                                        {product.name}
                                    </h3>
                                    <p className="text-2xl font-black text-primary mb-6">
                                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.price)}
                                    </p>

                                    <div className="space-y-4 mb-8">
                                        {specs.map((spec) => (
                                            <div key={spec} className="border-b border-[var(--border-subtle)] pb-3">
                                                <p className="text-[10px] uppercase tracking-widest text-secondary mb-1 font-bold">
                                                    {spec.replace(/([A-Z])/g, ' $1').trim()}
                                                </p>
                                                <p className="text-sm font-medium text-[var(--foreground)]">
                                                    {String(product.technicalSpecs[spec] || "-")}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] py-3 text-sm font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface-cta)] active:scale-95"
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
                <div className="mt-12 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-8 text-center">
                    <p className="text-secondary">You can add {4 - compareItems.length} more products to compare.</p>
                </div>
            )}
        </div>
    );
}
