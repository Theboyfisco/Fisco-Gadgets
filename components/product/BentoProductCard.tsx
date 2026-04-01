"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, ShoppingCart, Eye } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { CompareButton } from "./CompareButton";
import { WishlistButton } from "./WishlistButton";
import { Tilt3D } from "../ui/Tilt3D";
import { MOTION } from "@/lib/motion";
import { normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { useCart } from "../cart/CartProvider";

const QuickViewModal = dynamic(() => import("./QuickViewModal").then((mod) => mod.QuickViewModal), {
  ssr: false,
});

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
  href?: string;
}

function categoryTint() {
  return "from-primary/20";
}

function formatCategoryLabel(categoryId: string) {
  return categoryId.replace(/_/g, " ");
}

export function BentoProductCard({ product, featured = false, href }: BentoProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { addToCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const specs = normalizeTechnicalSpecs(product.technicalSpecs);
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in the ${product.name} listed for ₦${product.price}`);
  const priceLabel = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.price);
  const containerClass = featured
    ? "relative group overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-4 shadow-[0_24px_70px_rgba(8,18,38,0.18)] backdrop-blur-xl transition-all duration-[var(--motion-slow)] ease-[var(--ease-standard)] hover:-translate-y-1.5 hover:border-[var(--interactive-border-strong)] hover:shadow-[0_36px_100px_rgba(8,18,38,0.28)] md:p-5"
    : "relative group overflow-hidden rounded-[22px] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-4 shadow-[0_18px_46px_rgba(8,18,38,0.12)] backdrop-blur-xl transition-all duration-[var(--motion-slow)] ease-[var(--ease-standard)] hover:-translate-y-1 hover:border-[var(--interactive-border-strong)] hover:shadow-[0_28px_70px_rgba(8,18,38,0.2)]";

  return (
    <Tilt3D className="h-full" maxTilt={featured ? 8 : 10}>
      <motion.article
        whileHover={prefersReducedMotion ? undefined : { y: -4 }}
        transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
        className={containerClass}
      >
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-primary/12 blur-3xl transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:opacity-90" />
        <div className="pointer-events-none absolute inset-x-6 bottom-0 h-24 rounded-full bg-primary/8 blur-3xl transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:opacity-100" />

        <div className="[transform:translateZ(28px)]">
          <div className="relative mb-4 w-full overflow-hidden rounded-[18px] border border-[var(--border-subtle)] transition-all duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:border-[var(--interactive-border-strong)]">
            {href ? (
              <Link href={href} className="group/image block h-full w-full" aria-label={`View ${product.name}`}>
                <div className={`relative ${featured ? "h-64" : "h-48"} w-full`}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={92}
                    loading="lazy"
                    className={`object-cover transition-transform duration-[620ms] ease-[var(--ease-standard)] will-change-transform [transform:translateZ(36px)_scale(1.02)] ${
                      prefersReducedMotion ? "" : "group-hover/image:scale-[1.08]"
                    }`}
                    placeholder={product.blurHash ? "blur" : "empty"}
                    blurDataURL={product.blurHash}
                  />
                </div>
              </Link>
            ) : (
              <div className={`relative ${featured ? "h-64" : "h-48"} w-full`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={92}
                  loading="lazy"
                  className={`object-cover transition-transform duration-[620ms] ease-[var(--ease-standard)] will-change-transform [transform:translateZ(36px)_scale(1.02)] ${
                    prefersReducedMotion ? "" : "group-hover:scale-[1.08]"
                  }`}
                  placeholder={product.blurHash ? "blur" : "empty"}
                  blurDataURL={product.blurHash}
                />
              </div>
            )}
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${categoryTint()} via-transparent to-[var(--surface-contrast)]`} />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_38%,rgba(3,7,18,0.62))]" />
            <div className="absolute left-3 top-3 inline-flex items-center rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/88 backdrop-blur-md">
              {formatCategoryLabel(product.categoryId)}
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-end justify-between opacity-0 transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:translate-y-0 group-hover:opacity-100">
              <div className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/82 backdrop-blur-md">
                Verified stock
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/82 backdrop-blur-md">
                Fast delivery
              </div>
            </div>
          </div>

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">Premium pick</p>
              {href ? (
                <Link href={href} className="mt-2 block focus:outline-none">
                  <h3 className="line-clamp-2 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)] transition-colors duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:text-primary md:text-[1.45rem]">
                    {product.name}
                  </h3>
                </Link>
              ) : (
                <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-[1.45rem]">
                  {product.name}
                </h3>
              )}
            </div>
            <div className="shrink-0 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card-strong)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              New
            </div>
          </div>
          <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-xl">{priceLabel}</p>
          <p className="mt-1 text-sm text-secondary">Concierge checkout and warranty-backed delivery.</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 [transform:translateZ(18px)]">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Battery</p>
            <p className="mt-1 font-mono text-xs text-[var(--foreground)]">{specs.battery || "4500mAh"}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Storage</p>
            <p className="mt-1 font-mono text-xs text-[var(--foreground)]">{specs.storage || "128GB"}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Memory</p>
            <p className="mt-1 font-mono text-xs text-[var(--foreground)]">{specs.ram || "8GB"}</p>
          </div>
        </div>

        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 opacity-0 pointer-events-none translate-y-2 scale-[0.96] blur-[1px] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:scale-100 group-hover:blur-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:scale-100 group-focus-within:blur-0 [transform:translateZ(40px)]">
          <button
            className="rounded-full border border-primary/20 bg-[var(--surface-contrast)] p-2 text-primary shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition-colors hover:bg-primary/30"
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
            className="rounded-full border border-primary/20 bg-[var(--surface-contrast)] p-2 text-primary shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition-colors hover:bg-primary/30"
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
          <button
            type="button"
            className="rounded-full border border-primary/20 bg-[var(--surface-contrast)] p-2 text-primary shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md transition-colors hover:bg-primary/30"
            aria-label={`Message about ${product.name} on WhatsApp`}
            onClick={(event) => {
              event.stopPropagation();
              const url = `https://wa.me/2348000000000?text=${whatsappMsg}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
          >
            <MessageCircle size={20} />
          </button>
          <div onClick={(event) => event.stopPropagation()}>
            <CompareButton product={product} />
          </div>
        </div>

        <QuickViewModal product={product} isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
      </motion.article>
    </Tilt3D>
  );
}
