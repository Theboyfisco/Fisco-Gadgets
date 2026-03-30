"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const elements = Array.from(root.querySelectorAll<HTMLElement>("section, [data-reveal]"));
    const targets = elements.length > 0 ? elements : Array.from(root.children) as HTMLElement[];

    targets.forEach((el) => el.classList.add("scroll-reveal"));

    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add("scroll-reveal-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return <div ref={rootRef}>{children}</div>;
}
