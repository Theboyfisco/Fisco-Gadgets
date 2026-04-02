"use client";

import { useEffect } from "react";
import { trackRecentProduct } from "@/actions/customer-lists";
import { trackEvent } from "@/lib/analytics-client";

type RecentlyViewedProduct = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image: string;
  categoryId: string;
};

const STORAGE_KEY = "fisco_recently_viewed_v1";
const UPDATED_EVENT = "fisco-recently-viewed-updated";
const MAX_ITEMS = 8;

export function RecentlyViewedTracker({ product }: { product: RecentlyViewedProduct }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const items: RecentlyViewedProduct[] = stored ? JSON.parse(stored) : [];
      const next = [product, ...items.filter((item) => item.id !== product.id)].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event(UPDATED_EVENT));
    } catch {
      // Ignore storage failures; tracking is optional.
    }
    trackEvent({
      name: "pdp_engagement",
      payload: {
        event: "view",
        productId: product.id,
        categoryId: product.categoryId,
      },
    });
    trackRecentProduct(product.id).catch(() => null);
  }, [product]);

  return null;
}
