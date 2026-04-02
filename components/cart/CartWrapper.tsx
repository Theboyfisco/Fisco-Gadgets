"use client";

import { useCart } from "./CartProvider";
import { CartDrawer } from "./CartDrawer";

export function CartWrapper() {
    const {
        isCartOpen,
        toggleCart,
        cartItems,
        savedForLater,
        removeFromCart,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        moveToSavedForLater,
        moveSavedToCart,
        removeFromSavedForLater,
        clearSavedForLater,
    } = useCart();
    return (
        <CartDrawer
            isOpen={isCartOpen}
            onClose={toggleCart}
            cartItems={cartItems}
            savedForLater={savedForLater}
            onRemove={removeFromCart}
            onClear={clearCart}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            onSaveForLater={moveToSavedForLater}
            onMoveToCart={moveSavedToCart}
            onRemoveSaved={removeFromSavedForLater}
            onClearSaved={clearSavedForLater}
        />
    );
}
