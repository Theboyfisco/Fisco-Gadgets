"use client";

import { MessageCircle } from 'lucide-react';
import type { Product } from './BentoProductCard';
import { AddToCartButton } from './AddToCartButton';

export function StickyBottomCTA({ product }: { product: Product }) {
    const whatsappMsg = encodeURIComponent(`Hi, I want to buy ${product.name}`);

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-base/80 backdrop-blur-lg border-t border-border-subtle flex gap-3 z-50 sm:hidden">
            <AddToCartButton product={product} className="flex-1 bg-white/10 text-white rounded-standard py-3 font-medium active:scale-95 transition-transform" />
            <a
                href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                className="flex-1 bg-primary text-base rounded-standard py-3 font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-glow"
            >
                <MessageCircle size={18} />
                WhatsApp Buy
            </a>
        </div>
    );
}
