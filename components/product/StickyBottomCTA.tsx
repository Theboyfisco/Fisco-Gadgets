"use client";

import { MessageCircle } from 'lucide-react';
import type { Product } from './BentoProductCard';
import { AddToCartButton } from './AddToCartButton';

export function StickyBottomCTA({ product }: { product: Product }) {
    const whatsappMsg = encodeURIComponent(`Hi, I want to buy ${product.name}`);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-3 border-t border-border-subtle bg-[var(--panel-bg-soft)] p-4 backdrop-blur-lg sm:hidden">
            <AddToCartButton product={product} className="flex-1 rounded-standard border border-[var(--border-subtle)] bg-[var(--surface-cta)] py-3 font-medium text-[var(--foreground)] transition-transform active:scale-95" />
            <a
                href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                className="flex-1 bg-primary text-black text-base rounded-standard py-3 font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-glow"
            >
                <MessageCircle size={18} />
                WhatsApp Buy
            </a>
        </div>
    );
}
