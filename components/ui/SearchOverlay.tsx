"use client";

import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, Smartphone, Laptop, Headphones, ArrowRight, Gamepad } from "lucide-react";
import { searchProducts } from "@/actions/product";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MOTION } from "@/lib/motion";
import { WishlistButton } from "@/components/product/WishlistButton";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";

export function SearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const deferredQuery = useDeferredValue(query);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const performSearch = async () => {
      try {
        const dbResults = await searchProducts(deferredQuery);
        const mapped = dbResults.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: getPrimaryImage(product.images),
          categoryId: product.categoryId,
          technicalSpecs: normalizeTechnicalSpecs(product.technicalSpecs),
        }));
        if (cancelled) return;
        startTransition(() => {
          setResults(mapped);
          setActiveIndex(0);
        });
      } catch (error) {
        console.error("Search failed:", error);
      }
    };

    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [deferredQuery, isOpen]);

  useEffect(() => {
    if (quickViewProduct) return;
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowDown" && results.length > 0) {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
      }
      if (event.key === "ArrowUp" && results.length > 0) {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      }
      if (event.key === "Enter" && results.length > 0 && query) {
        const selected = results[activeIndex] ?? results[0];
        if (!selected) return;
        router.push(`/product/${selected.id}`);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [onClose, results, query, router, activeIndex, quickViewProduct]);

  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => inputRef.current?.focus(), 0);
      return;
    }

    lastActiveRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (quickViewProduct) return;

    const handleTabTrap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a,button,input,textarea,select,summary,[tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTabTrap);
    return () => document.removeEventListener("keydown", handleTabTrap);
  }, [isOpen, quickViewProduct]);

  const goToProduct = (productId: string) => {
    router.push(`/product/${productId}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center px-4 pt-4 sm:pt-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--overlay-strong)] backdrop-blur-[20px]"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-overlay-title"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.standard }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--panel-bg)] shadow-2xl"
          >
            <h2 id="search-overlay-title" className="sr-only">
              Search products
            </h2>
            <div className="flex items-center gap-4 border-b border-[var(--border-subtle)] p-4 sm:p-6">
              <div className={`rounded-xl p-2 transition-colors ${query ? "bg-primary/20 text-primary" : "bg-[var(--surface-card)] text-secondary"}`}>
                <SearchIcon size={24} />
              </div>
              <input
                autoFocus
                type="text"
                placeholder="Search iPhones, MacBooks, Accessories..."
                className="interactive-focus flex-1 bg-transparent text-lg font-bold text-[var(--foreground)] placeholder:text-[var(--text-soft)] focus:outline-none sm:text-2xl"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                ref={inputRef}
              />
              <button
                onClick={onClose}
                className="interactive-focus rounded-xl p-2 text-secondary transition-colors hover:bg-[var(--interactive-hover)] hover:text-[var(--foreground)]"
                aria-label="Close search"
              >
                <X size={24} />
              </button>
            </div>

            <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-4" aria-live="polite">
              {results.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-muted mb-4 px-2 text-xs font-bold uppercase tracking-widest">
                    {query ? `Found ${results.length} results` : "Trending Now"}
                  </p>
                  <div
                    className="grid grid-cols-1 gap-2"
                    role="listbox"
                    aria-label="Search results"
                    aria-activedescendant={results[activeIndex] ? `search-result-${activeIndex}` : undefined}
                  >
                    {results.map((product, index) => {
                      const active = index === activeIndex;
                      return (
                      <div
                        key={product.id}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`group rounded-[1.35rem] border p-3 transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] ${
                          active
                            ? "border-primary/40 bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] shadow-[0_16px_34px_rgba(8,18,38,0.1)]"
                            : "border-transparent hover:border-[var(--interactive-border-strong)] hover:bg-[var(--surface-card)]"
                        }`}
                      >
                        <div
                          id={`search-result-${index}`}
                          className="interactive-focus flex cursor-pointer items-center gap-4 rounded-[1rem]"
                          onClick={() => goToProduct(product.id)}
                          role="option"
                          aria-selected={active}
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              goToProduct(product.id);
                            }
                          }}
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[1rem] bg-[var(--surface-card)]">
                            <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:scale-105" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h4 className="truncate font-semibold text-[var(--foreground)] transition-colors group-hover:text-primary">{product.name}</h4>
                                <p className="text-muted mt-1 text-xs capitalize">
                                  {product.categoryId} • ₦{product.price.toLocaleString()}
                                </p>
                              </div>
                              <ArrowRight className="-translate-x-1 text-secondary opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" size={18} />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            onClick={() => setQuickViewProduct(product)}
                            className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                            aria-label={`Quick view ${product.name}`}
                          >
                            Quick
                          </button>
                          <Link
                            href={`/product/${product.id}`}
                            onClick={onClose}
                            className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            Open
                          </Link>
                          <WishlistButton product={product} />
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              ) : query ? (
                <div className="py-12 text-center">
                  <p className="text-muted text-lg">No gadgets found for &quot;{query}&quot;</p>
                  <button onClick={() => setQuery("")} className="interactive-focus link-accent mt-2">
                    Clear search
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted text-base">Start typing to see the latest drops.</p>
                </div>
              )}

              {!query && (
                <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    { icon: Smartphone, label: "Phones", color: "text-primary", href: "/category/phones" },
                    { icon: Laptop, label: "Laptops", color: "text-primary", href: "/category/laptops" },
                    { icon: Headphones, label: "Audio", color: "text-primary", href: "/category/audio" },
                    { icon: Gamepad, label: "Accessories", color: "text-primary", href: "/category/accessories" },
                  ].map((category, index) => (
                    <Link
                      key={index}
                      href={category.href}
                      onClick={onClose}
                      className="interactive-focus flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 text-left transition-colors hover:bg-[var(--interactive-hover)]"
                    >
                      <category.icon className={category.color} size={20} />
                      <span className="text-sm font-medium text-[var(--foreground)]">{category.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
              <div className="text-muted flex gap-4 text-[10px]">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-[var(--kbd-bg)] px-1">ESC</kbd> to close
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-[var(--kbd-bg)] px-1">↵</kbd> to select
                </span>
              </div>
              <p className="text-[10px] font-medium italic text-[var(--text-soft)]">Powered by Fisco Search</p>
            </div>
          </motion.div>
        </div>
      )}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </AnimatePresence>
  );
}
