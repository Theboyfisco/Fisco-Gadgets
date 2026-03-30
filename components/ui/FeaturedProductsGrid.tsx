"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BentoProductCard } from "@/components/product/BentoProductCard";
import { MOTION } from "@/lib/motion";

type FeaturedProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  technicalSpecs: Record<string, unknown>;
};

export function FeaturedProductsGrid({ products }: { products: FeaturedProduct[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
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
          className={index === 0 ? "md:col-span-2 lg:col-span-2" : ""}
        >
          <Link href={`/product/${product.id}`}>
            <BentoProductCard product={product as any} featured={index === 0} />
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
