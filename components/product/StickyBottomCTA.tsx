"use client";

import { MessageCircle } from 'lucide-react';
import type { Product } from './BentoProductCard';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from './WishlistButton';

export function StickyBottomCTA({ product }: { product: Product }) {
    const whatsappMsg = encodeURIComponent(`Hi, I want to buy ${product.name}`);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-3 border-t border-border-subtle bg-[linear-gradient(180deg,var(--panel-bg-soft),var(--surface-card))] p-4 backdrop-blur-lg sm:hidden">
            <AddToCartButton product={product} className="flex-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-cta)] py-3 font-medium text-[var(--foreground)] transition-transform active:scale-95" />
            <a
                href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                className="flex-1 rounded-full bg-primary py-3 text-base font-medium text-[var(--primary-contrast)] shadow-glow transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
                <MessageCircle size={18} />
                WhatsApp Buy
            </a>
            <WishlistButton product={product} className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-cta)] px-3" />
        </div>
    );
}

