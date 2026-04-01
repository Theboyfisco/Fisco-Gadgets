"use client";

import { useSyncExternalStore } from "react";

function getScrollProgress() {
  if (typeof window === "undefined") return 0;

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  return docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
}

function subscribe(callback: () => void) {
  let rafId = 0;
  const handleChange = () => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(callback);
  };

  window.addEventListener("scroll", handleChange, { passive: true });
  window.addEventListener("resize", handleChange);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("scroll", handleChange);
    window.removeEventListener("resize", handleChange);
  };
}

export function ScrollProgress() {
  const progress = useSyncExternalStore(subscribe, getScrollProgress, () => 0);

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[90] h-1 w-full bg-transparent">
      <div
        className="h-full bg-[linear-gradient(90deg,var(--brand-gradient-start),var(--brand-gradient-mid),var(--brand-gradient-end))] transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-standard)]"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
