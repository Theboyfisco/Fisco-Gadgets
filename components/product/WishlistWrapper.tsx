"use client";

import { useWishlist } from "./WishlistProvider";
import { WishlistDrawer } from "./WishlistDrawer";

export function WishlistWrapper() {
  const { isWishlistOpen, closeWishlistDrawer, wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  return (
    <WishlistDrawer
      isOpen={isWishlistOpen}
      onClose={closeWishlistDrawer}
      wishlistItems={wishlistItems}
      onRemove={removeFromWishlist}
      onClear={clearWishlist}
    />
  );
}
