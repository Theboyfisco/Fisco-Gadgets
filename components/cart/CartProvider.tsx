/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/components/product/BentoProductCard";
import { useToast } from "@/components/ui/ToastProvider";

interface CartContextType {
    cartItems: Product[];
    isCartOpen: boolean;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { pushToast } = useToast();

    // Load from local storage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("fisco_cart_v1");
            if (stored) {
                const parsed = JSON.parse(stored);
                queueMicrotask(() => setCartItems(parsed));
            }
        } catch (e) {
            console.error("Failed to load cart", e);
        }
        setMounted(true);
    }, []);

    // Sync to local storage
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("fisco_cart_v1", JSON.stringify(cartItems));
        }
    }, [cartItems, mounted]);

    const addToCart = (product: Product) => {
        // Optimistic UI update
        setCartItems(prev => [...prev, product]);
        setIsCartOpen(true);
        pushToast({
            title: "Added to cart",
            description: product.name,
            variant: "success",
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prev => {
            const next = prev.filter(item => item.id !== productId);
            return next;
        });
        pushToast({
            title: "Removed from cart",
            description: "Item removed from your cart.",
            variant: "info",
        });
    };

    const clearCart = () => {
        setCartItems([]);
        pushToast({
            title: "Cart cleared",
            description: "Your cart is now empty.",
            variant: "warning",
        });
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <CartContext.Provider value={{ cartItems, isCartOpen, addToCart, removeFromCart, clearCart, toggleCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
