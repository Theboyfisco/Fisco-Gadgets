"use client";

import { useCart } from "./CartProvider";
import { CartDrawer } from "./CartDrawer";

export function CartWrapper() {
    const { isCartOpen, toggleCart, cartItems } = useCart();
    return <CartDrawer isOpen={isCartOpen} onClose={toggleCart} cartItems={cartItems} />;
}
