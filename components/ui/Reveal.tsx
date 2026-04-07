"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { MOTION } from "@/lib/motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function Reveal({ children, className = "", delay = 0, y = 16 }: RevealProps) {
  const reducedMotion = useSafeReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0, delay: 0 } : { duration: MOTION.duration.slow, ease: MOTION.ease.standard, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
