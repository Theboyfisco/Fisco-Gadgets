"use client";

import { useCompare } from "./CompareProvider";
import { motion, AnimatePresence } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { Scale, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MOTION } from "@/lib/motion";
import { SafeImage } from "@/components/ui/SafeImage";

export function CompareFloatingBar() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const prefersReducedMotion = useSafeReducedMotion();

    if (compareItems.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { y: 100, opacity: 0 }}
                transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
                className="fixed bottom-6 left-1/2 z-50 w-[95%] max-w-2xl -translate-x-1/2"
            >
                <div className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-4 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-1 items-center gap-4 overflow-hidden">
                        <div className="hidden shrink-0 rounded-xl bg-primary/20 p-2 text-primary sm:flex">
                            <Scale size={20} />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                            {compareItems.map((item) => (
                                <div key={item.id} className="relative group shrink-0">
                                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
                                        <SafeImage src={item.image ?? ""} alt={item.name} fill className="object-cover" sizes="48px" />
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
                                <div key={i} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-secondary">Add</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        {compareItems.length >= 1 && (
                            <Link
                                href="/compare"
                                className="flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-[var(--primary-contrast)] shadow-glow transition-all hover:bg-[var(--primary-hover)] sm:px-6 sm:text-base"
                            >
                                Compare {compareItems.length}
                                <ArrowRight size={18} />
                            </Link>
                        )}
                        <button
                            onClick={clearCompare}
                            className="rounded-full border border-transparent p-2 text-secondary transition-colors hover:border-[var(--border-subtle)] hover:text-[var(--foreground)]"
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

