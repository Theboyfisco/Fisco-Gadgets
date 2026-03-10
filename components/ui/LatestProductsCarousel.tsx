"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface LatestProduct {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface LatestProductsCarouselProps {
  products: LatestProduct[];
}

const AUTOPLAY_INTERVAL = 4500;

export function LatestProductsCarousel({ products }: LatestProductsCarouselProps) {
  const visibleProducts = useMemo(() => products.filter((product) => Boolean(product.image)), [products]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (visibleProducts.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleProducts.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [visibleProducts.length]);

  useEffect(() => {
    if (activeIndex >= visibleProducts.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, visibleProducts.length]);

  const activeProduct = visibleProducts[activeIndex] ?? visibleProducts[0];

  if (!activeProduct) {
    return (
      <div className="relative h-[29rem] w-full max-w-xl overflow-hidden rounded-[1.8rem] border border-[var(--border-subtle)] bg-gradient-to-b from-[var(--surface-cta)] to-[var(--surface-soft)] p-6 shadow-2xl" />
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(activeProduct.price);

  return (
    <div className="group relative h-[28rem] w-full max-w-xl overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0b0f14] shadow-[0_30px_80px_rgba(8,12,20,0.55)]">
      <div className="absolute inset-0">
        <Image
          key={activeProduct.id}
          src={activeProduct.image}
          alt={activeProduct.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={96}
          className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.28),transparent_42%),linear-gradient(180deg,rgba(6,12,18,0.2),rgba(6,12,18,0.9))]" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end gap-6 p-7 text-white sm:p-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80">
          Latest drops
        </div>

        <div>
          <h3 className="text-3xl font-semibold leading-tight sm:text-4xl">{activeProduct.name}</h3>
          <p className="mt-2 text-lg font-semibold text-emerald-300">{formattedPrice}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/product/${activeProduct.id}`}
            className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white px-6 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black transition hover:border-white hover:bg-emerald-400 hover:text-black"
          >
            View Product
          </Link>
          <div className="flex h-[2px] w-24 overflow-hidden rounded-full bg-white/20">
            <span className="h-full w-full origin-left animate-[pulse_4.5s_ease-in-out_infinite] rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
