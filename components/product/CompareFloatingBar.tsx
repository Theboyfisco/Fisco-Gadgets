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
                <div className="bg-surface/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <div className="hidden sm:flex p-2 bg-primary/20 text-primary rounded-lg shrink-0">
                            <Scale size={20} />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                            {compareItems.map((item) => (
                                <div key={item.id} className="relative group shrink-0">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-white/5 relative">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <button
                                        onClick={() => removeFromCompare(item.id)}
                                        className="absolute -top-2 -right-2 bg-white text-black rounded-full p-0.5 shadow-lg lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {Array.from({ length: Math.max(0, 2 - compareItems.length) }).map((_, i) => (
                                <div key={i} className="w-12 h-12 rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center shrink-0">
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
                            className="text-secondary hover:text-white p-2"
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
