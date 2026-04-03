"use client";

import { motion } from "framer-motion";
import { BentoProductCard } from "@/components/product/BentoProductCard";
import { MOTION } from "@/lib/motion";

type GridProduct = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image: string;
  categoryId: string;
  technicalSpecs: Record<string, unknown>;
  brandId?: string;
  stock?: number;
};

interface ProductGridMotionProps {
  products: GridProduct[];
  className?: string;
}

export function ProductGridMotion({ products, className = "" }: ProductGridMotionProps) {
  return (
    <motion.div
      className={`grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${className}`}
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
          <BentoProductCard product={product as any} href={`/product/${product.slug ?? product.id}`} />
        </motion.div>
      ))}
    </motion.div>
  );
}
