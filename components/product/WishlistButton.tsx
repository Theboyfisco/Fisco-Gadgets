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
}

export function WishlistButton({ product, className = "", showLabel = false }: WishlistButtonProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { pushToast } = useToast();
  const active = isInWishlist(product.id);

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
        active ? "text-primary" : "text-secondary hover:text-[var(--foreground)]"
      } ${className}`}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <motion.div whileTap={{ scale: 0.85 }} className={`rounded-full border p-2 ${active ? "border-primary/30 bg-primary/20" : "border-[var(--border-subtle)] bg-[var(--surface-card)]"}`}>
        <Heart size={18} className={active ? "fill-current" : ""} />
      </motion.div>
      {showLabel && <span className="text-sm font-medium">{active ? "Wishlisted" : "Wishlist"}</span>}
    </button>
  );
}
