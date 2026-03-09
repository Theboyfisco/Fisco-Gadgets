"use client";

import { useCompare } from "./CompareProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CompareFloatingBar() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();

    if (compareItems.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl"
            >
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-card-strong)] p-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <div className="hidden sm:flex p-2 bg-primary/20 text-primary rounded-lg shrink-0">
                            <Scale size={20} />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                            {compareItems.map((item) => (
                                <div key={item.id} className="relative group shrink-0">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <button
                                        onClick={() => removeFromCompare(item.id)}
                                        className="absolute -right-2 -top-2 rounded-full bg-[var(--surface-card-strong)] p-0.5 text-[var(--foreground)] shadow-lg transition-opacity lg:opacity-0 lg:group-hover:opacity-100"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {Array.from({ length: Math.max(0, 2 - compareItems.length) }).map((_, i) => (
                                <div key={i} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-secondary">Add</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {compareItems.length >= 1 && (
                            <Link
                                href="/compare"
                                className="bg-primary hover:bg-emerald-400 text-base px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-glow whitespace-nowrap"
                            >
                                Compare {compareItems.length}
                                <ArrowRight size={18} />
                            </Link>
                        )}
                        <button
                            onClick={clearCompare}
                            className="p-2 text-secondary hover:text-[var(--foreground)]"
                            title="Clear all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
