"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Eye, ShoppingCart } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { WishlistButton } from "./WishlistButton";
import { Tilt3D } from "../ui/Tilt3D";
import { SafeImage } from "@/components/ui/SafeImage";
import { MOTION } from "@/lib/motion";
import { normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { useCart } from "../cart/CartProvider";
import { useHydrated } from "@/lib/useHydrated";

const QuickViewModal = dynamic(
  () => import("./QuickViewModal").then((mod) => mod.QuickViewModal),
  {
    ssr: false,
  },
);

export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image: string;
  categoryId: string;
  brandId?: string;
  stock?: number;
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

function categoryToneValue(categoryId: string) {
  if (categoryId.includes("phone")) return "var(--tone-phones)";
  if (categoryId.includes("laptop") || categoryId.includes("macbook"))
    return "var(--tone-laptops)";
  if (categoryId.includes("audio") || categoryId.includes("headphone"))
    return "var(--tone-audio)";
  return "var(--tone-generic)";
}

function formatCategoryLabel(categoryId: string) {
  return categoryId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function BentoProductCard({
  product,
  featured = false,
  href,
}: BentoProductCardProps) {
  const hydrated = useHydrated();
  const reducedMotionPreference = useReducedMotion();
  const prefersReducedMotion = hydrated && reducedMotionPreference;
  const { addToCart } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const specs = normalizeTechnicalSpecs(product.technicalSpecs);
  const isOutOfStock = typeof product.stock === "number" && product.stock <= 0;
  const isLowStock =
    typeof product.stock === "number" &&
    product.stock > 0 &&
    product.stock <= 5;
  const priceLabel = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(product.price);
  const toneValue = categoryToneValue(product.categoryId);
  const stockLabel = isOutOfStock
    ? "Out of stock"
    : isLowStock
      ? `Only ${product.stock}`
      : "In stock";
  const stockClass = isOutOfStock
    ? "border-[var(--status-error)]/45 bg-[var(--status-error)]/12 text-[var(--status-error)]"
    : isLowStock
      ? "border-[var(--status-error)]/35 bg-[var(--status-error)]/10 text-[var(--status-error)]"
      : "border-[var(--interactive-border)] bg-[var(--surface-card-strong)] text-primary";
  const containerClass = featured
    ? "relative isolate group flex h-full flex-col overflow-hidden rounded-[26px] border border-[var(--interactive-border)] bg-[linear-gradient(155deg,var(--surface-card-strong),var(--surface-card)_48%,var(--surface-soft))] p-4 shadow-[0_30px_100px_rgba(8,18,38,0.18)] backdrop-blur-xl transition-all duration-[var(--motion-slow)] ease-[var(--ease-standard)] hover:-translate-y-1.5 hover:border-[var(--interactive-border-strong)] hover:shadow-[0_42px_115px_rgba(8,18,38,0.25)] md:p-5"
    : "relative isolate group flex h-full flex-col overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[linear-gradient(155deg,var(--surface-card),var(--surface-soft)_56%,var(--surface-card))] p-4 shadow-[0_18px_52px_rgba(8,18,38,0.12)] backdrop-blur-xl transition-all duration-[var(--motion-slow)] ease-[var(--ease-standard)] hover:-translate-y-1 hover:border-[var(--interactive-border-strong)] hover:shadow-[0_30px_86px_rgba(8,18,38,0.2)]";

  return (
    <Tilt3D className="h-full" maxTilt={featured ? 8 : 10}>
      <motion.article
        whileHover={prefersReducedMotion ? undefined : { y: -4 }}
        transition={{
          duration: MOTION.duration.base,
          ease: MOTION.ease.standard,
        }}
        className={containerClass}
      >
        <div
          className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full blur-3xl transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:opacity-95"
          style={{ background: toneValue, opacity: 0.32 }}
        />
        <div className="pointer-events-none absolute inset-x-8 bottom-0 h-24 rounded-full bg-primary/8 blur-3xl transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,transparent,rgba(8,18,38,0.06))] opacity-60" />

        <div className="[transform:translateZ(28px)]">
          <div className="relative mb-4 w-full overflow-hidden rounded-[20px] border border-[var(--interactive-border)] transition-all duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:border-[var(--interactive-border-strong)]">
            {href ? (
              <Link
                href={href}
                className="group/image block h-full w-full"
                aria-label={`View ${product.name}`}
              >
                <div
                  className={`relative ${featured ? "h-[clamp(14rem,26vw,18.5rem)]" : "h-[clamp(12rem,22vw,15rem)]"} w-full`}
                >
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={92}
                    loading="lazy"
                    className={`object-cover transition-transform duration-[620ms] ease-[var(--ease-standard)] will-change-transform [transform:translateZ(36px)_scale(1.02)] ${
                      prefersReducedMotion
                        ? ""
                        : "group-hover/image:scale-[1.1]"
                    }`}
                    placeholder={product.blurHash ? "blur" : "empty"}
                    blurDataURL={product.blurHash}
                  />
                </div>
              </Link>
            ) : (
              <div
                className={`relative ${featured ? "h-[clamp(14rem,26vw,18.5rem)]" : "h-[clamp(12rem,22vw,15rem)]"} w-full`}
              >
                <SafeImage
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  quality={92}
                  loading="lazy"
                  className={`object-cover transition-transform duration-[620ms] ease-[var(--ease-standard)] will-change-transform [transform:translateZ(36px)_scale(1.02)] ${
                    prefersReducedMotion ? "" : "group-hover:scale-[1.1]"
                  }`}
                  placeholder={product.blurHash ? "blur" : "empty"}
                  blurDataURL={product.blurHash}
                />
              </div>
            )}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${categoryTint()} via-transparent to-[var(--surface-contrast)]`}
            />
            <div className="pointer-events-none absolute inset-0 bg-[image:var(--media-overlay-gradient)]" />
            <div className="absolute left-3 top-3 inline-flex items-center rounded-full border border-[var(--media-overlay-border)] bg-[var(--media-overlay-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--media-overlay-text)] backdrop-blur-md">
              {formatCategoryLabel(product.categoryId)}
            </div>
            <div
              className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md ${stockClass}`}
            >
              {stockLabel}
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-2 items-end justify-between opacity-0 transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:translate-y-0 group-hover:opacity-100 md:group-hover:translate-y-3 md:group-hover:opacity-0">
              <div className="rounded-full border border-[var(--media-overlay-border)] bg-[var(--media-overlay-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--media-overlay-soft-text)] backdrop-blur-md">
                Verified stock
              </div>
              <div className="rounded-full border border-[var(--media-overlay-border)] bg-[var(--media-overlay-action-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--media-overlay-soft-text)] backdrop-blur-md">
                Fast delivery
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 hidden translate-y-3 opacity-0 transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:block">
              <div className="pointer-events-auto flex items-center justify-center rounded-[1rem] border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--panel-bg-soft),var(--surface-card))] p-2 shadow-[0_18px_45px_rgba(8,18,38,0.28)] backdrop-blur-xl">
                <button
                  className="inline-flex h-10 min-w-[8.75rem] items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/12 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:border-primary/50 hover:bg-primary/18 hover:text-primary"
                  aria-label={`Quick preview ${product.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    setQuickViewOpen(true);
                  }}
                >
                  <Eye size={16} />
                  Preview
                </button>
                <button
                  className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/12 text-primary shadow-[0_10px_24px_rgba(63,107,253,0.2)] transition-colors hover:border-primary/40 hover:bg-primary/22 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={`Add ${product.name} to cart`}
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    if (!isOutOfStock) {
                      addToCart(product);
                    }
                  }}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart size={18} />
                </button>
                <div
                  className="ml-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <WishlistButton product={product} variant="dock" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">
                NOX Signature
              </p>
              {href ? (
                <Link
                  href={href}
                  className="mt-2 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
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
            <div className="shrink-0 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
              Premium
            </div>
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--foreground)] md:text-xl">
              {priceLabel}
            </p>
            {href ? (
              <Link
                href={href}
                className="interactive-focus inline-flex items-center gap-1.5 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-[var(--foreground)]"
              >
                Details
                <ArrowUpRight size={12} />
              </Link>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-secondary">
            Concierge checkout, verified originals, and warranty-backed
            delivery.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5 [transform:translateZ(18px)]">
          <div className="rounded-2xl border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-soft),var(--surface-card))] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
              Battery
            </p>
            <p className="mt-1 font-mono text-xs font-semibold text-[var(--foreground)]">
              {specs.battery || "4500mAh"}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-soft),var(--surface-card))] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
              Storage
            </p>
            <p className="mt-1 font-mono text-xs font-semibold text-[var(--foreground)]">
              {specs.storage || "128GB"}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-soft),var(--surface-card))] px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
              Memory
            </p>
            <p className="mt-1 font-mono text-xs font-semibold text-[var(--foreground)]">
              {specs.ram || "8GB"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 [transform:translateZ(20px)] md:hidden">
          <button
            className="flex-1 rounded-full border border-primary/25 bg-primary px-4 py-2.5 text-sm font-semibold text-[var(--primary-contrast)] shadow-[0_16px_36px_rgba(63,107,253,0.22)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={`Add ${product.name} to cart`}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              if (!isOutOfStock) {
                addToCart(product);
              }
            }}
            disabled={isOutOfStock}
          >
            Add to cart
          </button>
          <div
            className="shrink-0"
            onClick={(event) => event.stopPropagation()}
          >
            <WishlistButton product={product} variant="dock" />
          </div>
        </div>

        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      </motion.article>
    </Tilt3D>
  );
}
