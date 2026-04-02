"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CartItem } from "./CartProvider";
import { MOTION } from "@/lib/motion";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { SafeImage } from "@/components/ui/SafeImage";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    savedForLater: CartItem["product"][];
    onRemove: (productId: string) => void;
    onClear: () => void;
    onIncrease: (productId: string) => void;
    onDecrease: (productId: string) => void;
    onSaveForLater: (productId: string) => void;
    onMoveToCart: (productId: string) => void;
    onRemoveSaved: (productId: string) => void;
    onClearSaved: () => void;
}

export function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    savedForLater,
    onRemove,
    onClear,
    onIncrease,
    onDecrease,
    onSaveForLater,
    onMoveToCart,
    onRemoveSaved,
    onClearSaved,
}: CartDrawerProps) {
    const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const prefersReducedMotion = useReducedMotion();
    const dialogRef = useRef<HTMLDivElement>(null);
    const lastActiveRef = useRef<HTMLElement | null>(null);

    useBodyScrollLock(isOpen);

    useEffect(() => {
        if (isOpen) {
            lastActiveRef.current = document.activeElement as HTMLElement | null;
            setTimeout(() => dialogRef.current?.focus(), 0);
            return;
        }
        lastActiveRef.current?.focus();
    }, [isOpen, onClose]);

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
                        className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm transition-opacity"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: MOTION.duration.slow }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border-subtle bg-[linear-gradient(180deg,var(--panel-bg),var(--surface-card))] p-6 shadow-2xl backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            id="cart-drawer"
            tabIndex={-1}
            ref={dialogRef}
          >
                        <div className="mb-8 flex items-center justify-between border-b border-[var(--border-subtle)] pb-5">
                            <h2 id="cart-title" className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
                                <ShoppingBag /> Your Cart
                            </h2>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-secondary transition-colors hover:bg-[var(--surface-cta)] hover:text-[var(--foreground)]"
                                aria-label="Close cart"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items list */}
                        {cartItems.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center text-center">
                                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] text-secondary shadow-[0_18px_50px_rgba(8,18,38,0.1)]">
                                    <ShoppingBag size={48} />
                                </div>
                                <p className="text-secondary text-lg">Your gadget stash is empty.</p>
                                <button onClick={onClose} className="mt-4 font-medium text-primary transition-colors hover:text-[var(--primary-hover)]">
                                    Continue Browsing
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.product.id} className="flex items-center gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-4 shadow-[0_16px_34px_rgba(8,18,38,0.08)]">
                                        <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-cta)]">
                                            {item.product.image && <SafeImage src={item.product.image} alt={item.product.name} fill className="object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-[var(--foreground)]">{item.product.name}</h4>
                                            <p className="text-primary text-sm">
                                                {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(item.product.price)}
                                            </p>
                                            {typeof item.product.stock === "number" && item.product.stock <= 0 && (
                                                <p className="mt-1 text-xs font-semibold text-[var(--status-error)]">Out of stock</p>
                                            )}
                                            {typeof item.product.stock === "number" && item.product.stock > 0 && item.product.stock <= 5 && (
                                                <p className="mt-1 text-xs font-semibold text-[var(--status-error)]">{item.product.stock} left</p>
                                            )}
                                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-cta)] px-2 py-1 text-xs text-secondary">
                                                <button
                                                    onClick={() => onDecrease(item.product.id)}
                                                    className="h-6 w-6 rounded-full border border-[var(--border-subtle)] text-sm font-semibold text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                                                    aria-label={`Decrease quantity for ${item.product.name}`}
                                                >
                                                    -
                                                </button>
                                                <span className="min-w-[2ch] text-center text-sm font-semibold text-[var(--foreground)]">{item.quantity}</span>
                                                <button
                                                    onClick={() => onIncrease(item.product.id)}
                                                    disabled={typeof item.product.stock === "number" && item.quantity >= item.product.stock}
                                                    className="h-6 w-6 rounded-full border border-[var(--border-subtle)] text-sm font-semibold text-secondary transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                                                    aria-label={`Increase quantity for ${item.product.name}`}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right text-xs text-secondary">
                                            <p className="font-semibold text-[var(--foreground)]">
                                                {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(item.product.price * item.quantity)}
                                            </p>
                                            <p>Line total</p>
                                        </div>
                                        <button
                                            onClick={() => onRemove(item.product.id)}
                                            className="rounded-full border border-[var(--border-subtle)] p-2 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                                            aria-label={`Remove ${item.product.name} from cart`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onSaveForLater(item.product.id)}
                                            className="rounded-full border border-[var(--border-subtle)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                                            aria-label={`Save ${item.product.name} for later`}
                                        >
                                            Save
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {savedForLater.length > 0 && (
                            <div className="mt-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Saved for later</p>
                                    <button
                                        onClick={onClearSaved}
                                        className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {savedForLater.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2">
                                            <p className="line-clamp-1 text-sm font-medium text-[var(--foreground)]">{product.name}</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onMoveToCart(product.id)}
                                                    className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                                                >
                                                    Move
                                                </button>
                                                <button
                                                    onClick={() => onRemoveSaved(product.id)}
                                                    className="rounded-full border border-[var(--border-subtle)] p-1.5 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                                                    aria-label={`Remove ${product.name} from saved for later`}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {cartItems.length > 0 && (
                            <div className="mt-auto space-y-4 border-t border-border-subtle pt-6">
                                <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                                    <div className="flex justify-between text-sm text-secondary">
                                        <span>Items</span>
                                        <span>{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
                                    </div>
                                    <div className="mt-2 flex justify-between text-lg font-bold text-[var(--foreground)]">
                                        <span>Total</span>
                                        <span>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(total)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClear}
                                        className="flex-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] py-3 text-sm font-semibold text-secondary transition-colors hover:text-[var(--foreground)]"
                                    >
                                        Clear cart
                                    </button>
                                    <Link
                                        href="/checkout"
                                        onClick={onClose}
                                        className="flex flex-1 items-center justify-center rounded-full bg-primary py-3 text-center text-base font-bold text-[var(--primary-contrast)] shadow-glow transition-colors hover:bg-[var(--primary-hover)] active:scale-95"
                                    >
                                        Secure Checkout
                                    </Link>
                                </div>
                                <Link
                                    href="/"
                                    onClick={onClose}
                                    className="block text-center text-sm font-medium text-secondary hover:text-[var(--foreground)]"
                                >
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

