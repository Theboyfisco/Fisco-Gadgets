"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MOTION } from "@/lib/motion";
import { useHydrated } from "@/lib/useHydrated";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const reducedMotionPreference = useReducedMotion();
  const prefersReducedMotion = hydrated && reducedMotionPreference;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
