"use client";

import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { Product } from "@/components/product/BentoProductCard";
import { ProductGridMotion } from "@/components/ui/ProductGridMotion";
import { useWishlist } from "@/components/product/WishlistProvider";

export default function WishlistPage() {
  const { wishlistItems, clearWishlist } = useWishlist();

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <Reveal className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Wishlist</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">Saved gadgets</h1>
          <p className="mt-2 text-sm text-secondary">Keep track of the devices you plan to buy.</p>
        </div>
        {wishlistItems.length > 0 && (
          <button
            onClick={clearWishlist}
            className="interactive-focus rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:border-[var(--interactive-border-strong)] hover:text-[var(--foreground)]"
          >
            Clear wishlist
          </button>
        )}
      </Reveal>

      {wishlistItems.length === 0 ? (
        <div className="rounded-[1.75rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-12 text-center shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
          <p className="text-lg text-secondary">Your wishlist is empty.</p>
          <Link href="/" className="interactive-focus link-accent mt-2 inline-block text-sm">
            Browse featured drops
          </Link>
        </div>
      ) : (
        <Reveal>
          <ProductGridMotion products={wishlistItems as Product[]} />
        </Reveal>
      )}
    </div>
  );
}
