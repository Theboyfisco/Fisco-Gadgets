"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/components/product/BentoProductCard";
import { getCustomerListsClient, syncCustomerListClient } from "@/lib/customer-lists-api";

interface CompareContextType {
  compareItems: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);
const COMPARE_KEY = "noxtech_compare_v1";

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARE_KEY);
      if (stored) {
        setCompareItems(JSON.parse(stored) as Product[]);
      }
    } catch (error) {
      console.error("Failed to load comparison list", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareItems));
  }, [compareItems, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    (async () => {
      const synced = await getCustomerListsClient();
      if (cancelled || !synced.authenticated) return;
      if (synced.compare.length > 0) {
        setCompareItems((prev) => {
          const merged = [...synced.compare, ...prev.filter((item) => !synced.compare.some((db) => db.id === item.id))];
          return merged.slice(0, 4);
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
      syncCustomerListClient(
        "COMPARE",
        compareItems.map((item) => item.id),
      ).catch(() => null);
    }, 200);
    return () => clearTimeout(timer);
  }, [compareItems, hydrated]);

  const addToCompare = (product: Product) => {
    setCompareItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      if (prev.length >= 4) {
        return [...prev.slice(1), product];
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCompare = () => setCompareItems([]);

  const isInCompare = (productId: string) => {
    return compareItems.some((item) => item.id === productId);
  };

  return (
    <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare, isInCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error("useCompare must be used within CompareProvider");
  return context;
}
