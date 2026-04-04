"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MOTION } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0.96, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: MOTION.duration.fast, ease: MOTION.ease.enter }}
    >
      {children}
    </motion.div>
  );
}
