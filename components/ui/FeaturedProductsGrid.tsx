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
    <div className="relative">
      <div className="pointer-events-none absolute -left-14 top-6 h-36 w-36 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 bottom-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <motion.div
        className="relative grid grid-cols-1 gap-[clamp(1rem,1.6vw,1.75rem)] xl:grid-cols-2 2xl:grid-cols-12"
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
            className={
              index === 0
                ? "xl:col-span-2 2xl:col-span-6"
                : index === 1
                  ? "xl:col-span-1 2xl:col-span-3"
                  : index === 2
                    ? "xl:col-span-1 2xl:col-span-3"
                    : "xl:col-span-1 2xl:col-span-3"
            }
          >
            <BentoProductCard product={product as any} featured={index === 0} href={`/product/${product.slug ?? product.id}`} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
