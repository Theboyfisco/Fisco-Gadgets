"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { Product } from "./BentoProductCard";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";
import { CompareButton } from "./CompareButton";
import { MOTION } from "@/lib/motion";
import { createPortal } from "react-dom";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { SafeImage } from "@/components/ui/SafeImage";
import { useHydrated } from "@/lib/useHydrated";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const hydrated = useHydrated();

  useBodyScrollLock(isOpen);

  const specs = useMemo(() => {
    const entries = Object.entries(product.technicalSpecs ?? {}).filter(([, value]) => value !== undefined);
    return entries.slice(0, 6);
  }, [product.technicalSpecs]);

  useEffect(() => {
    if (!isOpen) return;
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    setTimeout(() => dialogRef.current?.focus(), 0);
    return () => lastActiveRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
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
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleTabTrap);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
            className="fixed inset-0 z-[90] bg-[var(--overlay-strong)] backdrop-blur-[10px]"
          />
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.standard }}
            className="fixed left-1/2 top-1/2 z-[100] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--panel-bg),var(--surface-card))] shadow-2xl backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`quick-view-${product.id}`}
            tabIndex={-1}
            ref={dialogRef}
          >
            <div className="grid gap-6 p-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-[0_24px_80px_rgba(8,18,38,0.16)]">
                {product.image && (
                  <SafeImage src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 90vw, 50vw" />
                )}
                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/88 backdrop-blur-md">
                  Quick view
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id={`quick-view-${product.id}`} className="text-2xl font-bold text-[var(--foreground)]">
                      {product.name}
                    </h2>
                    <p className="mt-2 text-xl font-semibold text-primary">
                      {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.price)}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-secondary transition-colors hover:bg-[var(--surface-cta)] hover:text-[var(--foreground)]"
                    aria-label="Close quick view"
                  >
                    <X size={22} />
                  </button>
                </div>

                {specs.length > 0 && (
                  <div className="mt-6 space-y-3 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[0_16px_34px_rgba(8,18,38,0.08)]">
                    {specs.map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-secondary">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                        <span className="font-medium text-[var(--foreground)]">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <AddToCartButton product={product} className="rounded-full bg-primary py-3 text-sm font-semibold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)]" />
                  <Link
                    href={`/product/${product.slug ?? product.id}`}
                    className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] py-3 text-center text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-cta)]"
                  >
                    View details
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <WishlistButton product={product} />
                  <CompareButton product={product} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!hydrated) return null;
  return createPortal(content, document.body);
}
