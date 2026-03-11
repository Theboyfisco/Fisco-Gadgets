"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '../product/BentoProductCard';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: Product[];
}

export function CartDrawer({ isOpen, onClose, cartItems }: CartDrawerProps) {
    const total = cartItems.reduce((acc, item) => acc + item.price, 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm transition-opacity"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-border-subtle bg-[var(--panel-bg)] p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
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
                            <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--surface-card)] text-secondary">
                                    <ShoppingBag size={48} />
                                </div>
                                <p className="text-secondary text-lg">Your gadget stash is empty.</p>
                                <button onClick={onClose} className="mt-4 text-primary hover:text-emerald-400 font-medium">
                                    Continue Browsing
                                </button>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {cartItems.map((item, idx) => (
                                    <div key={`${item.id}-${idx}`} className="flex items-center justify-between rounded-standard border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                                        <div>
                                            <h4 className="font-semibold text-[var(--foreground)]">{item.name}</h4>
                                            <p className="text-primary text-sm">
                                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {cartItems.length > 0 && (
                            <div className="pt-6 border-t border-border-subtle mt-auto space-y-4">
                                <div className="flex justify-between text-lg font-bold text-[var(--foreground)]">
                                    <span>Total</span>
                                    <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(total)}</span>
                                </div>
                                <Link 
                                    href="/checkout" 
                                    onClick={onClose}
                                    className="w-full bg-primary text-black text-base py-4 rounded-standard font-bold hover:bg-emerald-400 transition-colors shadow-glow active:scale-95 text-center flex items-center justify-center"
                                >
                                    Secure Checkout
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
