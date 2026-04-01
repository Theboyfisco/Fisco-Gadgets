"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { MOTION } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function Reveal({ children, className = "", delay = 0, y = 16 }: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.standard, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
