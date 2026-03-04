"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, Smartphone, Laptop, Headphones, ArrowRight, Gamepad } from "lucide-react";
import { searchProducts } from "@/actions/product";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    // Search logic
    useEffect(() => {
        const performSearch = async () => {
            setIsSearching(true);
            try {
                const dbResults = await searchProducts(query);
                const mapped = dbResults.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: p.images[0],
                    categoryId: p.categoryId,
                    technicalSpecs: p.technicalSpecs as any
                }));
                setResults(mapped);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(() => {
            if (isOpen) performSearch();
        }, 300);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && results.length > 0 && query) {
                router.push(`/product/${results[0].id}`);
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [onClose, results, query, router]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col pt-4 sm:pt-20 px-4 items-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(20px)' }}
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="relative w-full max-w-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                        style={{ backgroundColor: '#0f0f13' }}
                    >
                        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-4">
                            <div className={`p-2 rounded-xl transition-colors ${query ? "bg-primary/20 text-primary" : "bg-white/5 text-secondary"}`}>
                                <SearchIcon size={24} />
                            </div>
                            <input 
                                autoFocus
                                type="text"
                                placeholder="Search iPhones, MacBooks, Accessories..."
                                className="flex-1 bg-transparent text-lg sm:text-2xl font-bold text-white placeholder:text-secondary focus:outline-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button 
                                onClick={onClose}
                                className="p-2 text-secondary hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                            {results.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-secondary uppercase tracking-widest px-2 mb-4">
                                        {query ? `Found ${results.length} results` : "Trending Now"}
                                    </p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {results.map((product) => (
                                            <Link 
                                                key={product.id} 
                                                href={`/product/${product.id}`}
                                                onClick={onClose}
                                                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                                            >
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-base shrink-0">
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-semibold group-hover:text-primary transition-colors">{product.name}</h4>
                                                    <p className="text-xs text-secondary capitalize">{product.categoryId} • ₦{product.price.toLocaleString()}</p>
                                                </div>
                                                <ArrowRight className="text-secondary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" size={18} />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-secondary text-lg">No gadgets found for &quot;{query}&quot;</p>
                                    <button onClick={() => setQuery("")} className="mt-2 text-primary hover:underline">Clear search</button>
                                </div>
                            )}

                            {!query && (
                                <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    {[
                                        { icon: Smartphone, label: "Phones", color: "text-blue-400", href: "/category/phones" },
                                        { icon: Laptop, label: "Laptops", color: "text-purple-400", href: "/category/laptops" },
                                        { icon: Headphones, label: "Audio", color: "text-orange-400", href: "/category/audio" },
                                        { icon: Gamepad, label: "Accessories", color: "text-emerald-400", href: "/category/accessories" }
                                    ].map((cat, i) => (
                                        <Link 
                                            key={i} 
                                            href={cat.href}
                                            onClick={onClose}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 text-left"
                                        >
                                            <cat.icon className={cat.color} size={20} />
                                            <span className="text-sm font-medium text-white">{cat.label}</span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                            <div className="flex gap-4 text-[10px] text-secondary">
                                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">ESC</kbd> to close</span>
                                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1 rounded">↵</kbd> to select</span>
                            </div>
                            <p className="text-[10px] text-primary/60 font-medium italic">Powered by Fisco Search</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
