"use client";

import { MessageCircle } from 'lucide-react';
import type { Product } from './BentoProductCard';
import { AddToCartButton } from './AddToCartButton';
import { WishlistButton } from './WishlistButton';
import { buildWhatsAppLink } from "@/lib/support-config";

export function StickyBottomCTA({ product }: { product: Product }) {
    const whatsappUrl = buildWhatsAppLink(`Hi, I want to buy ${product.name}`);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-2 border-t border-border-subtle bg-[linear-gradient(180deg,var(--panel-bg-soft),var(--surface-card))] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-lg sm:hidden">
            <AddToCartButton product={product} className="flex-1 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-cta)] py-2.5 text-sm font-semibold text-[var(--foreground)] transition-transform active:scale-95" />
            <a
                href={whatsappUrl}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-[var(--primary-contrast)] shadow-glow transition-transform active:scale-95"
            >
                <MessageCircle size={17} />
                <span className="max-[360px]:hidden">WhatsApp</span>
                <span className="min-[361px]:hidden">Chat</span>
            </a>
            <WishlistButton product={product} className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-cta)] px-2.5 py-2.5" />
        </div>
    );
}

