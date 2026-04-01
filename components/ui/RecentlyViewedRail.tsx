"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { MOTION } from "@/lib/motion";

type RecentlyViewedProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
};

const STORAGE_KEY = "fisco_recently_viewed_v1";
const UPDATED_EVENT = "fisco-recently-viewed-updated";
const EMPTY_ITEMS: RecentlyViewedProduct[] = [];
let cachedRaw = "";
let cachedItems: RecentlyViewedProduct[] = EMPTY_ITEMS;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function refreshFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) ?? "";
    if (stored === cachedRaw) return;
    cachedRaw = stored;
    cachedItems = stored ? (JSON.parse(stored) as RecentlyViewedProduct[]) : EMPTY_ITEMS;
    emit();
  } catch {
    // Ignore storage errors; keep last cached value.
  }
}

function getSnapshot() {
  return cachedItems;
}

function getServerSnapshot() {
  return EMPTY_ITEMS;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function RecentlyViewedRail() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    refreshFromStorage();
    const handler = () => refreshFromStorage();
    window.addEventListener("storage", handler);
    window.addEventListener(UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener(UPDATED_EVENT, handler);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <Reveal className="mb-20 lg:mb-24">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Resume browsing</p>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Recently viewed</h2>
          <p className="text-sm text-secondary">Pick up where you left off.</p>
        </div>
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-[var(--foreground)]"
        >
          Compare products
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto pb-2">
        <motion.div
          className="flex w-max gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: { opacity: 1, y: 0, transition: { duration: MOTION.duration.base, ease: MOTION.ease.standard } },
              }}
              className="w-64 shrink-0"
            >
              <Link
                href={`/product/${item.id}`}
                className="group block overflow-hidden rounded-[1.6rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3 transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(8,18,38,0.22)]"
              >
                <div className="relative mb-3 h-40 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-cta)]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-[var(--motion-slow)] ease-[var(--ease-standard)] group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">{item.categoryId}</p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--foreground)]">{item.name}</h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    ₦{item.price.toLocaleString()}
                  </span>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors group-hover:text-[var(--foreground)]">
                  <Clock3 size={12} />
                  Viewed
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Reveal>
  );
}
