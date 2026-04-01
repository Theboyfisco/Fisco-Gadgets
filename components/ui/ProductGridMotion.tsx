"use client";

import { motion } from "framer-motion";
import { BentoProductCard } from "@/components/product/BentoProductCard";
import { MOTION } from "@/lib/motion";

type GridProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  technicalSpecs: Record<string, unknown>;
  brandId?: string;
};

interface ProductGridMotionProps {
  products: GridProduct[];
  className?: string;
}

export function ProductGridMotion({ products, className = "" }: ProductGridMotionProps) {
  return (
    <motion.div
      className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: MOTION.duration.base, ease: MOTION.ease.standard } },
          }}
        >
          <BentoProductCard product={product as any} href={`/product/${product.id}`} />
        </motion.div>
      ))}
    </motion.div>
  );
}
