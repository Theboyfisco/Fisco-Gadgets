"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/components/product/BentoProductCard";
import { getCustomerLists, syncCustomerList } from "@/actions/customer-lists";

interface WishlistContextType {
  wishlistItems: Product[];
  isWishlistOpen: boolean;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  toggleWishlistDrawer: () => void;
  closeWishlistDrawer: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("fisco_wishlist_v1");
      if (stored) {
        setWishlistItems(JSON.parse(stored) as Product[]);
      }
    } catch (error) {
      console.error("Failed to load wishlist", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("fisco_wishlist_v1", JSON.stringify(wishlistItems));
  }, [wishlistItems, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      const synced = await getCustomerLists();
      if (cancelled || !synced.authenticated) return;
      if (synced.wishlist.length > 0) {
        setWishlistItems((prev) => {
          const merged = [...synced.wishlist, ...prev.filter((item) => !synced.wishlist.some((db) => db.id === item.id))];
          return merged;
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      syncCustomerList(
        "WISHLIST",
        wishlistItems.map((item) => item.id),
      ).catch(() => null);
    }, 200);

    return () => clearTimeout(timer);
  }, [wishlistItems, hydrated]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const clearWishlist = () => setWishlistItems([]);

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const toggleWishlistDrawer = () => setIsWishlistOpen((prev) => !prev);
  const closeWishlistDrawer = () => setIsWishlistOpen(false);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isWishlistOpen,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        isInWishlist,
        toggleWishlistDrawer,
        closeWishlistDrawer,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
