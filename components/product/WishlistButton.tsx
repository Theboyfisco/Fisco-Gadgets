"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Product } from "@/components/product/BentoProductCard";
import { useWishlist } from "./WishlistProvider";
import { useToast } from "@/components/ui/ToastProvider";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  showLabel?: boolean;
  variant?: "default" | "dock";
}

export function WishlistButton({ product, className = "", showLabel = false, variant = "default" }: WishlistButtonProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { pushToast } = useToast();
  const active = isInWishlist(product.id);
  const isDock = variant === "dock";

  const handleToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist(product);
    pushToast({
      title: active ? "Removed from wishlist" : "Saved to wishlist",
      description: product.name,
      variant: active ? "info" : "success",
    });
  };

  return (
    <button
      onClick={handleToggle}
      aria-pressed={active}
      className={`flex items-center gap-2 transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] ${
        isDock
          ? active
            ? "text-primary"
            : "text-[var(--foreground)]"
          : active
            ? "text-primary"
            : "text-secondary hover:text-[var(--foreground)]"
      } ${className}`}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        className={`inline-flex items-center justify-center border shadow-[0_12px_30px_rgba(8,18,38,0.12)] transition-colors duration-[var(--motion-base)] ease-[var(--ease-standard)] ${
          isDock
            ? active
              ? "h-10 w-10 rounded-xl border-primary/40 bg-primary/18"
              : "h-10 w-10 rounded-xl border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-active)]"
            : active
              ? "rounded-full border-primary/30 bg-primary/20 p-2"
              : "rounded-full border-[var(--border-subtle)] bg-[var(--surface-card)] p-2"
        }`}
      >
        <Heart size={18} className={active ? "fill-current" : ""} />
      </motion.div>
      {showLabel && <span className="text-sm font-medium">{active ? "Wishlisted" : "Wishlist"}</span>}
    </button>
  );
}
