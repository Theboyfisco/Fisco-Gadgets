"use client";

import { useCompare } from "@/components/product/CompareProvider";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Trash2, ShoppingCart, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartProvider";
import { MOTION } from "@/lib/motion";

export default function ComparePage() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();
    const prefersReducedMotion = useReducedMotion();

    const specs = Array.from(new Set(
        compareItems.flatMap(item => Object.keys(item.technicalSpecs))
    ));

    if (compareItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] text-secondary/40 shadow-[0_18px_50px_rgba(8,18,38,0.1)]">
                    <ShoppingCart size={80} />
                </div>
                <h1 className="mb-4 text-4xl font-extrabold text-[var(--foreground)]">Comparison List is Empty</h1>
                <p className="text-secondary mb-12">Add some products to see them compared side-by-side.</p>
                <Link href="/" className="rounded-full bg-primary px-8 py-4 text-base font-bold text-[var(--primary-contrast)] shadow-glow transition-all hover:bg-[var(--primary-hover)]">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-16 flex-1">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                    <Link href="/" className="group mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2 text-secondary transition-colors hover:text-[var(--foreground)]">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Continue Shopping
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight text-[var(--foreground)] md:text-5xl">Compare Products</h1>
                </div>
                <button
                    onClick={clearCompare}
                    className="flex w-fit items-center gap-2 rounded-full border border-error/20 bg-error/10 px-4 py-2 text-error transition-colors hover:text-error/80"
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
                                initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                                transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
                                className="h-fit overflow-hidden rounded-[1.8rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] shadow-glass backdrop-blur-xl"
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
                                    <p className="mb-6 text-2xl font-black text-primary">
                                        {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.price)}
                                    </p>

                                    <div className="mb-8 space-y-3">
                                        {specs.map((spec) => (
                                            <div key={spec} className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
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
                                            className="w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] py-3 text-sm font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface-cta)] active:scale-95"
                                        >
                                            Add to Cart
                                        </button>
                                        <a
                                            href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hi, I'm comparing products and I'm interested in the ${product.name}`)}`}
                                            className="flex w-full items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 py-3 text-sm font-bold text-primary transition-all hover:bg-primary/20"
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
                <div className="mt-12 rounded-[1.8rem] border-2 border-dashed border-[var(--border-subtle)] bg-[var(--surface-soft)] p-8 text-center">
                    <p className="text-secondary">You can add {4 - compareItems.length} more products to compare.</p>
                </div>
            )}
        </div>
    );
}

