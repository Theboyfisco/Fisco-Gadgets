"use client";

import { motion } from "framer-motion";
import { BentoProductCard } from "@/components/product/BentoProductCard";
import { MOTION } from "@/lib/motion";

type FeaturedProduct = {
  id: string;
  name: string;
  slug?: string;
  price: number;
  image: string;
  categoryId: string;
  stock?: number;
  brandId?: string;
  technicalSpecs: Record<string, unknown>;
};

export function FeaturedProductsGrid({ products }: { products: FeaturedProduct[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-[clamp(1rem,1.7vw,1.8rem)] md:grid-cols-2 2xl:grid-cols-4"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 14 },
            show: { opacity: 1, y: 0, transition: { duration: MOTION.duration.base, ease: MOTION.ease.standard } },
          }}
          className={index === 0 ? "md:col-span-2 2xl:col-span-2" : ""}
        >
          <BentoProductCard product={product as any} featured={index === 0} href={`/product/${product.slug ?? product.id}`} />
        </motion.div>
      ))}
    </motion.div>
  );
}
