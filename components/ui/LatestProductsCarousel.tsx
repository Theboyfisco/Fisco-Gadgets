"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { useHydrated } from "@/lib/useHydrated";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/normalize-product";

export interface LatestProduct {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image: string;
  stock?: number;
  brandId?: string;
}

interface LatestProductsCarouselProps {
  products: LatestProduct[];
}

const AUTOPLAY_INTERVAL = 4500;

export function LatestProductsCarousel({ products }: LatestProductsCarouselProps) {
  const hydrated = useHydrated();
  const reducedMotionPreference = useReducedMotion();
  const visibleProducts = useMemo(
    () =>
      products.map((product) => ({
        ...product,
        image: product.image || DEFAULT_PRODUCT_IMAGE,
      })),
    [products],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageHidden, setPageHidden] = useState(false);
  const prefersReducedMotion = hydrated && reducedMotionPreference;

  const count = visibleProducts.length;
  const safeIndex = count ? activeIndex % count : 0;
  const activeProduct = visibleProducts[safeIndex] ?? visibleProducts[0];

  useEffect(() => {
    const handleVisibilityChange = () => setPageHidden(document.visibilityState === "hidden");
    handleVisibilityChange();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const isPaused = pageHidden;

  useEffect(() => {
    if (count <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, AUTOPLAY_INTERVAL);

    return () => window.clearInterval(timer);
  }, [count, isPaused]);

  const goNext = () => setActiveIndex((current) => (count ? (current + 1) % count : 0));
  const goPrev = () => setActiveIndex((current) => (count ? (current - 1 + count) % count : 0));

  if (!activeProduct) {
    return (
      <div className="relative h-[29rem] w-full max-w-xl overflow-hidden rounded-[1.8rem] border border-[var(--carousel-border)] bg-[var(--carousel-surface)] p-6 shadow-[var(--carousel-shadow)]" />
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(activeProduct.price);

  return (
    <div
      className="group relative h-[clamp(20rem,58vw,28rem)] w-full max-w-[52rem] overflow-hidden rounded-[clamp(1.5rem,2.5vw,2.2rem)] border border-[var(--carousel-border)] bg-[var(--carousel-surface)] shadow-[var(--carousel-shadow)] sm:h-[clamp(22rem,45vw,30rem)] xl:h-[clamp(24rem,33vw,34rem)]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      <div className="pointer-events-none absolute -left-14 -top-16 h-44 w-44 rounded-full bg-[var(--carousel-glow-1)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-[var(--carousel-glow-2)] blur-3xl" />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeProduct.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
        >
          <Image
            src={activeProduct.image}
            alt={activeProduct.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            quality={95}
            className={`object-cover opacity-95 ${prefersReducedMotion ? "" : "transition duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:scale-[1.03]"}`}
          />
          <div className="absolute inset-0 bg-[var(--carousel-overlay)]" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 flex h-full flex-col justify-between p-[clamp(1rem,2.2vw,2rem)]">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--carousel-control-border)] bg-[var(--carousel-control-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--foreground)] backdrop-blur-md">
            Featured now
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={goPrev}
              disabled={count <= 1}
              aria-label="Previous product"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--carousel-control-border)] bg-[var(--carousel-control-bg)] text-[var(--foreground)] backdrop-blur-md transition duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:border-primary/50 hover:text-primary"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={count <= 1}
              aria-label="Next product"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--carousel-control-border)] bg-[var(--carousel-control-bg)] text-[var(--foreground)] backdrop-blur-md transition duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:border-primary/50 hover:text-primary"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-6 text-[var(--media-card-foreground)]">
          <motion.div
            key={`${activeProduct.id}-content`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
            className="space-y-6"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--media-card-pill-border)] bg-[var(--media-card-pill-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[var(--media-card-pill-text)]">
              Latest drops
            </div>

            <div>
              <h3 className="text-[clamp(1.55rem,3.3vw,2.65rem)] font-semibold leading-tight">{activeProduct.name}</h3>
              <p className="mt-2 text-[clamp(0.95rem,1.6vw,1.15rem)] font-semibold text-primary">{formattedPrice}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--carousel-control-border)] bg-[var(--carousel-control-bg)] p-3 backdrop-blur-md">
              <Link
                href={`/product/${activeProduct.slug ?? activeProduct.id}`}
                className="inline-flex items-center justify-center rounded-full border border-[var(--media-card-pill-border)] bg-[var(--surface-card-strong)] px-6 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--foreground)] transition hover:border-primary/40 hover:bg-primary/25"
              >
                View Product
              </Link>
              <div className="flex items-center gap-2" aria-label="Carousel slide selector">
                {visibleProducts.map((item, index) => {
                  const isActive = index === safeIndex;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Show ${item.name}`}
                      aria-current={isActive ? "true" : "false"}
                      whileTap={{ scale: 0.9 }}
                      className={`h-2.5 rounded-full transition-all ${isActive ? "w-7 bg-[var(--carousel-dot-active)]" : "w-2.5 bg-[var(--carousel-dot)] hover:bg-[var(--carousel-dot-active)]/70"}`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--carousel-control-border)]/40">
              <motion.div
                key={safeIndex}
                className="h-full rounded-full bg-[var(--carousel-dot-active)]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
