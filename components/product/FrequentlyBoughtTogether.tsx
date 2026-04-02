"use client";

import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/components/product/BentoProductCard";

export function FrequentlyBoughtTogether({ products }: { products: Product[] }) {
  const { addToCart } = useCart();
  if (products.length === 0) return null;

  const total = products.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Frequently bought together</p>
      <h3 className="mt-2 text-2xl font-bold text-[var(--foreground)]">Complete the setup</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => addToCart(product)}
            className="rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-left transition-colors hover:border-primary/30"
          >
            <p className="line-clamp-2 text-sm font-semibold text-[var(--foreground)]">{product.name}</p>
            <p className="mt-2 text-sm text-primary">
              {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.price)}
            </p>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-secondary">
          Bundle value:{" "}
          <span className="font-semibold text-[var(--foreground)]">
            {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(total)}
          </span>
        </p>
        <button
          type="button"
          onClick={() => products.forEach((item) => addToCart(item))}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)]"
        >
          Add all to cart
        </button>
      </div>
    </div>
  );
}
