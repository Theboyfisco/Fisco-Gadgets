/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/components/product/BentoProductCard";
import { useToast } from "@/components/ui/ToastProvider";

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    isCartOpen: boolean;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    clearCart: () => void;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeStoredCart(items: any[]): CartItem[] {
    return items
        .map((item) => {
            if (!item) return null;
            if (item.product && typeof item.quantity === "number") {
                return { product: item.product as Product, quantity: item.quantity };
            }
            if (item.id) {
                return { product: item as Product, quantity: 1 };
            }
            return null;
        })
        .filter(Boolean) as CartItem[];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { pushToast } = useToast();

    // Load from local storage
    useEffect(() => {
        try {
            const stored = localStorage.getItem("fisco_cart_v1");
            if (stored) {
                const parsed = JSON.parse(stored);
                const normalized = Array.isArray(parsed) ? normalizeStoredCart(parsed) : [];
                queueMicrotask(() => setCartItems(normalized));
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

    const addToCart = (product: Product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item,
                );
            }
            return [...prev, { product, quantity }];
        });
        setIsCartOpen(true);
        pushToast({
            title: "Added to cart",
            description: product.name,
            variant: "success",
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
        pushToast({
            title: "Removed from cart",
            description: "Item removed from your cart.",
            variant: "info",
        });
    };

    const increaseQuantity = (productId: string) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
            ),
        );
    };

    const decreaseQuantity = (productId: string) => {
        setCartItems((prev) =>
            prev
                .map((item) =>
                    item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
                )
                .filter((item) => item.quantity > 0),
        );
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
        <CartContext.Provider
            value={{
                cartItems,
                isCartOpen,
                addToCart,
                removeFromCart,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
