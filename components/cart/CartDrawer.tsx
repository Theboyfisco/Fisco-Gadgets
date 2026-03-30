"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, X, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Product } from "../product/BentoProductCard";
import { MOTION } from "@/lib/motion";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: Product[];
    onRemove: (productId: string) => void;
    onClear: () => void;
}

export function CartDrawer({ isOpen, onClose, cartItems, onRemove, onClear }: CartDrawerProps) {
    const total = cartItems.reduce((acc, item) => acc + item.price, 0);
    const prefersReducedMotion = useReducedMotion();
    const dialogRef = useRef<HTMLDivElement>(null);
    const lastActiveRef = useRef<HTMLElement | null>(null);

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
                        className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border-subtle bg-[var(--panel-bg)] p-6 shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cart-title"
                        tabIndex={-1}
                        ref={dialogRef}
                    >
                        <div className="mb-8 flex items-center justify-between">
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
                                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--surface-card)] text-secondary">
                                    <ShoppingBag size={48} />
                                </div>
                                <p className="text-secondary text-lg">Your gadget stash is empty.</p>
                                <button onClick={onClose} className="mt-4 font-medium text-primary transition-colors hover:text-[var(--primary-hover)]">
                                    Continue Browsing
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {cartItems.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex items-center gap-4 rounded-standard border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
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
                                            onClick={() => onRemove(item.id)}
                                            className="rounded-full border border-[var(--border-subtle)] p-2 text-secondary transition-colors hover:border-primary/40 hover:text-primary"
                                            aria-label={`Remove ${item.name} from cart`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {cartItems.length > 0 && (
                            <div className="mt-auto space-y-4 border-t border-border-subtle pt-6">
                                <div className="flex justify-between text-lg font-bold text-[var(--foreground)]">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(total)}</span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClear}
                                        className="flex-1 rounded-standard border border-[var(--border-subtle)] bg-[var(--surface-card)] py-3 text-sm font-semibold text-secondary transition-colors hover:text-[var(--foreground)]"
                                    >
                                        Clear cart
                                    </button>
                                    <Link
                                        href="/checkout"
                                        onClick={onClose}
                                        className="flex-1 bg-primary text-[var(--primary-contrast)] text-base py-3 rounded-standard font-bold hover:bg-[var(--primary-hover)] transition-colors shadow-glow active:scale-95 text-center flex items-center justify-center"
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

