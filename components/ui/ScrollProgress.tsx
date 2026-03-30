"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId = 0;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const next = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setProgress(next);
      rafId = requestAnimationFrame(update);
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[90] h-1 w-full bg-transparent">
      <div
        className="h-full bg-[linear-gradient(90deg,var(--brand-gradient-start),var(--brand-gradient-mid),var(--brand-gradient-end))] transition-[width] duration-[var(--motion-fast)] ease-[var(--ease-standard)]"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
