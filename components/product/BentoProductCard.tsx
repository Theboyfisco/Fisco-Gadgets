"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, ShoppingCart, Eye } from "lucide-react";
import Image from "next/image";
import { CompareButton } from "./CompareButton";
import { Tilt3D } from "../ui/Tilt3D";
import { MOTION } from "@/lib/motion";
import { useCart } from "../cart/CartProvider";
import { WishlistButton } from "./WishlistButton";
import { QuickViewModal } from "./QuickViewModal";
import { useState } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  brandId?: string;
  blurHash?: string;
  technicalSpecs: {
    battery?: string;
    storage?: string;
    ram?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

interface BentoProductCardProps {
  product: Product;
  featured?: boolean;
}

function categoryTint() {
  return "from-primary/20";
}

export function BentoProductCard({ product, featured = false }: BentoProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { addToCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in the ${product.name} listed for ₦${product.price}`);
  const containerClass = featured
    ? "relative group overflow-hidden border border-border-subtle bg-surface/90 backdrop-blur-md shadow-glow rounded-featured p-4 md:p-5"
    : "relative group overflow-hidden border border-border-subtle bg-surface/80 backdrop-blur-md rounded-standard p-4";

  return (
    <Tilt3D className="h-full" maxTilt={featured ? 8 : 10}>
      <motion.div
        whileHover={prefersReducedMotion ? undefined : { y: -4 }}
        transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
        className={containerClass}
      >
        <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />

        <div className={`relative mb-4 w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] ${featured ? "h-64" : "h-48"}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={92}
            className={`object-cover transition-transform duration-[var(--motion-slow)] ease-[var(--ease-standard)] will-change-transform [transform:translateZ(36px)_scale(1.03)] ${
              prefersReducedMotion ? "" : "group-hover:scale-110"
            }`}
            placeholder={product.blurHash ? "blur" : "empty"}
            blurDataURL={product.blurHash}
          />
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${categoryTint()} via-transparent to-[var(--surface-contrast)]`} />
        </div>

        <div className="[transform:translateZ(28px)]">
          <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] md:text-2xl">{product.name}</h3>
          <p className="mt-1 text-lg font-semibold text-primary md:text-xl">
            {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.price)}
          </p>
        </div>

        <div className="mt-4 flex justify-between border-t border-[var(--border-subtle)] pt-4 font-mono text-xs text-secondary transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 [transform:translateZ(18px)]">
          <span>{product.technicalSpecs.battery || "4500mAh"}</span>
          <span>{product.technicalSpecs.storage || "128GB"}</span>
          <span>{product.technicalSpecs.ram || "8GB"}</span>
        </div>

        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-0 pointer-events-none transition-opacity duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto [transform:translateZ(40px)]">
          <button
            className="rounded-full border border-primary/20 bg-[var(--surface-contrast)] p-2 text-primary backdrop-blur-md transition-colors hover:bg-primary/30"
            aria-label={`Add ${product.name} to cart`}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              addToCart(product);
            }}
          >
            <ShoppingCart size={20} />
          </button>
          <button
            className="rounded-full border border-primary/20 bg-[var(--surface-contrast)] p-2 text-primary backdrop-blur-md transition-colors hover:bg-primary/30"
            aria-label={`Quick view ${product.name}`}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              setQuickViewOpen(true);
            }}
          >
            <Eye size={20} />
          </button>
          <div onClick={(event) => event.stopPropagation()}>
            <WishlistButton product={product} />
          </div>
          <a
            href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
            className="rounded-full border border-primary/20 bg-[var(--surface-contrast)] p-2 text-primary backdrop-blur-md transition-colors hover:bg-primary/30"
            onClick={(event) => event.stopPropagation()}
          >
            <MessageCircle size={20} />
          </a>
          <div onClick={(event) => event.stopPropagation()}>
            <CompareButton product={product} />
          </div>
        </div>
        <QuickViewModal product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
      </motion.div>
    </Tilt3D>
  );
}
