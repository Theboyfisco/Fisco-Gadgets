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

    const getMaxStock = (product: Product) => (typeof product.stock === "number" ? product.stock : Number.POSITIVE_INFINITY);

    useEffect(() => {
        try {
            const stored = localStorage.getItem("fisco_cart_v1");
            if (stored) {
                const parsed = JSON.parse(stored);
                const normalized = Array.isArray(parsed) ? normalizeStoredCart(parsed) : [];
                setCartItems(normalized);
            }
        } catch (e) {
            console.error("Failed to load cart", e);
        } finally {
            setMounted(true);
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem("fisco_cart_v1", JSON.stringify(cartItems));
    }, [cartItems, mounted]);

    const addToCart = (product: Product, quantity = 1) => {
        const maxStock = getMaxStock(product);
        if (maxStock <= 0) {
            pushToast({
                title: "Out of stock",
                description: product.name,
                variant: "warning",
            });
            return;
        }

        setCartItems((prev) => {
            const existing = prev.find((item) => item.product.id === product.id);
            if (existing) {
                const nextQty = Math.min(existing.quantity + quantity, maxStock);
                return prev.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: nextQty }
                        : item,
                );
            }
            return [...prev, { product, quantity: Math.min(quantity, maxStock) }];
        });
        setIsCartOpen(true);
        if (maxStock !== Number.POSITIVE_INFINITY && quantity >= maxStock) {
            pushToast({
                title: "Stock limit reached",
                description: `Only ${maxStock} available for ${product.name}.`,
                variant: "warning",
            });
            return;
        }
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
            prev.map((item) => {
                if (item.product.id !== productId) return item;
                const maxStock = getMaxStock(item.product);
                if (item.quantity >= maxStock) {
                    pushToast({
                        title: "Stock limit reached",
                        description: `Only ${maxStock} available for ${item.product.name}.`,
                        variant: "warning",
                    });
                    return item;
                }
                return { ...item, quantity: item.quantity + 1 };
            }),
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
