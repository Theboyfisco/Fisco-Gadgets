"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, Trash2, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Product } from "./BentoProductCard";
import { MOTION } from "@/lib/motion";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useCart } from "../cart/CartProvider";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function WishlistDrawer({ isOpen, onClose, wishlistItems, onRemove, onClear }: WishlistDrawerProps) {
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const { addToCart } = useCart();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      setTimeout(() => dialogRef.current?.focus(), 0);
      return;
    }
    lastActiveRef.current?.focus();
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
            className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: MOTION.duration.slow }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border-subtle bg-[linear-gradient(180deg,var(--panel-bg),var(--surface-card))] p-6 shadow-2xl backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wishlist-title"
            id="wishlist-drawer"
            tabIndex={-1}
            ref={dialogRef}
          >
            <div className="mb-8 flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
              <h2 id="wishlist-title" className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
                <Heart /> Wishlist
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-secondary transition-colors hover:bg-[var(--surface-cta)] hover:text-[var(--foreground)]"
                aria-label="Close wishlist"
              >
                <X size={24} />
              </button>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] text-secondary shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.1)]">
                  <Heart size={48} />
                </div>
                <p className="text-secondary text-lg">No saved gadgets yet.</p>
                <Link href="/" onClick={onClose} className="mt-4 font-medium text-primary transition-colors hover:text-[var(--primary-hover)]">
                  Browse featured drops
                </Link>
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-4 shadow-[0_16px_34px_rgba(var(--shadow-neutral-rgb),0.08)]">
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-cta)]">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--foreground)]">{item.name}</h4>
                      <p className="text-primary text-sm">
                        {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="rounded-full border border-[var(--border-subtle)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="rounded-full border border-[var(--border-subtle)] p-2 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {wishlistItems.length > 0 && (
              <div className="mt-auto space-y-4 border-t border-border-subtle pt-6">
                <div className="flex gap-3">
                  <button
                    onClick={onClear}
                    className="flex-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] py-3 text-sm font-semibold text-secondary transition-colors hover:text-[var(--foreground)]"
                  >
                    Clear wishlist
                  </button>
                  <Link
                    href="/wishlist"
                    onClick={onClose}
                    className="flex-1 rounded-full bg-primary py-3 text-center text-base font-bold text-[var(--primary-contrast)] shadow-glow transition-colors hover:bg-[var(--primary-hover)] active:scale-95"
                  >
                    View wishlist
                  </Link>
                </div>
                <Link href="/" onClick={onClose} className="block text-center text-sm font-medium text-secondary hover:text-[var(--foreground)]">
                  Continue shopping
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

