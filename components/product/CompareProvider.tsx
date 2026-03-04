"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/components/product/BentoProductCard";

interface CompareContextType {
    compareItems: Product[];
    addToCompare: (product: Product) => void;
    removeFromCompare: (productId: string) => void;
    clearCompare: () => void;
    isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [compareItems, setCompareItems] = useState<Product[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load from local storage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("fisco_compare_v1");
            if (stored) {
                setCompareItems(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load comparison list", e);
        }
        setMounted(true);
    }, []);

    // Sync to local storage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("fisco_compare_v1", JSON.stringify(compareItems));
        }
    }, [compareItems, mounted]);

    const addToCompare = (product: Product) => {
        setCompareItems(prev => {
            if (prev.some(item => item.id === product.id)) return prev;
            if (prev.length >= 4) {
                // Limit to 4 for better UX on mobile
                return [...prev.slice(1), product];
            }
            return [...prev, product];
        });
    };

    const removeFromCompare = (productId: string) => {
        setCompareItems(prev => prev.filter(item => item.id !== productId));
    };

    const clearCompare = () => setCompareItems([]);

    const isInCompare = (productId: string) => {
        return compareItems.some(item => item.id === productId);
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
