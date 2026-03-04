"use client";

import { useCart } from "../cart/CartProvider";
import type { Product } from "./BentoProductCard";

export function AddToCartButton({ product, className }: { product: Product; className?: string }) {
    const { addToCart } = useCart();

    return (
        <button
            onClick={() => addToCart(product)}
            className={className || "flex-1 bg-white/5 hover:bg-white/10 text-white rounded-standard py-4 font-bold active:scale-95 transition-all outline-none focus:ring-2 focus:ring-white/20 border border-white/10"}
        >
            Add to Cart
        </button>
    );
}
