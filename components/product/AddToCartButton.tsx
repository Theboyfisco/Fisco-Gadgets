"use client";

import { useCart } from "../cart/CartProvider";
import type { Product } from "./BentoProductCard";

export function AddToCartButton({ product, className }: { product: Product; className?: string }) {
    const { addToCart } = useCart();

    return (
        <button
            onClick={() => addToCart(product)}
            className={
                className ||
                "flex-1 rounded-standard border border-[var(--border-subtle)] bg-[var(--surface-card)] py-4 font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface-cta)] active:scale-95 outline-none focus:ring-2 focus:ring-[var(--border-strong)]"
            }
        >
            Add to Cart
        </button>
    );
}
