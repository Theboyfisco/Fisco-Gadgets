"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/components/product/BentoProductCard";
import { useToast } from "@/components/ui/ToastProvider";
import { getCustomerLists, syncCustomerCart, syncCustomerList } from "@/actions/customer-lists";
import { trackEvent } from "@/lib/analytics-client";

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    savedForLater: Product[];
    isCartOpen: boolean;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    moveToSavedForLater: (productId: string) => void;
    moveSavedToCart: (productId: string) => void;
    removeFromSavedForLater: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    clearCart: () => void;
    clearSavedForLater: () => void;
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
    const [savedForLater, setSavedForLater] = useState<Product[]>([]);
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

            const saved = localStorage.getItem("fisco_saved_for_later_v1");
            if (saved) {
                const parsedSaved = JSON.parse(saved);
                if (Array.isArray(parsedSaved)) {
                    setSavedForLater(parsedSaved as Product[]);
                }
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

    useEffect(() => {
        if (!mounted) return;
        localStorage.setItem("fisco_saved_for_later_v1", JSON.stringify(savedForLater));
    }, [savedForLater, mounted]);

    useEffect(() => {
        if (!mounted) return;
        let cancelled = false;
        (async () => {
            const synced = await getCustomerLists();
            if (cancelled || !synced.authenticated) return;
            if (synced.cart.length > 0) {
                setCartItems((prev) => {
                    const merged = [...synced.cart, ...prev.filter((item) => !synced.cart.some((db) => db.product.id === item.product.id))];
                    return merged;
                });
            }
            if (synced.savedForLater.length > 0) {
                setSavedForLater((prev) => [
                    ...synced.savedForLater,
                    ...prev.filter((item) => !synced.savedForLater.some((db) => db.id === item.id)),
                ]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [mounted]);

    useEffect(() => {
        if (!mounted) return;
        const timer = setTimeout(() => {
            syncCustomerCart(
                cartItems.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
            ).catch(() => null);
        }, 220);
        return () => clearTimeout(timer);
    }, [cartItems, mounted]);

    useEffect(() => {
        if (!mounted) return;
        const timer = setTimeout(() => {
            syncCustomerList(
                "SAVE_FOR_LATER",
                savedForLater.map((item) => item.id),
            ).catch(() => null);
        }, 220);
        return () => clearTimeout(timer);
    }, [savedForLater, mounted]);

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
        trackEvent({
            name: "add_to_cart",
            payload: {
                productId: product.id,
                quantity,
                cartSize: cartItems.length + 1,
            },
        });
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

    const moveToSavedForLater = (productId: string) => {
        setCartItems((prev) => {
            const target = prev.find((item) => item.product.id === productId);
            if (target) {
                setSavedForLater((savedPrev) => {
                    if (savedPrev.some((item) => item.id === target.product.id)) return savedPrev;
                    return [target.product, ...savedPrev];
                });
            }
            return prev.filter((item) => item.product.id !== productId);
        });
        pushToast({
            title: "Saved for later",
            description: "Item moved out of checkout list.",
            variant: "info",
        });
    };

    const moveSavedToCart = (productId: string) => {
        const product = savedForLater.find((item) => item.id === productId);
        if (!product) return;
        addToCart(product, 1);
        setSavedForLater((prev) => prev.filter((item) => item.id !== productId));
    };

    const removeFromSavedForLater = (productId: string) => {
        setSavedForLater((prev) => prev.filter((item) => item.id !== productId));
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

    const clearSavedForLater = () => {
        setSavedForLater([]);
    };

    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                savedForLater,
                isCartOpen,
                addToCart,
                removeFromCart,
                moveToSavedForLater,
                moveSavedToCart,
                removeFromSavedForLater,
                increaseQuantity,
                decreaseQuantity,
                clearCart,
                clearSavedForLater,
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
