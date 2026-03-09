"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { CompareButton } from "./CompareButton";
import { Tilt3D } from "../ui/Tilt3D";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryId: string;
  brandId?: string;
  blurHash?: string;
  technicalSpecs: {
    battery?: string;
    storage?: string;
    ram?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

interface BentoProductCardProps {
  product: Product;
  featured?: boolean;
}

function categoryTint(categoryId: string) {
  if (categoryId === "phones") return "from-cyan-400/20";
  if (categoryId === "laptops") return "from-indigo-400/20";
  if (categoryId === "audio") return "from-orange-400/20";
  return "from-emerald-400/20";
}

export function BentoProductCard({ product, featured = false }: BentoProductCardProps) {
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in the ${product.name} listed for ₦${product.price}`);
  const containerClass = featured
    ? "relative group overflow-hidden border border-border-subtle bg-surface/90 backdrop-blur-md shadow-glow rounded-featured p-4 md:p-5"
    : "relative group overflow-hidden border border-border-subtle bg-surface/80 backdrop-blur-md rounded-standard p-4";

  return (
    <Tilt3D className="h-full" maxTilt={featured ? 8 : 10}>
      <motion.div whileHover={{ y: -4 }} className={containerClass}>
        <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 rounded-full bg-primary/15 blur-3xl" />

        <div className={`relative mb-4 w-full overflow-hidden rounded-xl border border-[var(--border-subtle)] ${featured ? "h-64" : "h-48"}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={92}
            className="object-cover transition-transform duration-500 will-change-transform [transform:translateZ(36px)_scale(1.03)] group-hover:scale-110"
            placeholder={product.blurHash ? "blur" : "empty"}
            blurDataURL={product.blurHash}
          />
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${categoryTint(product.categoryId)} via-transparent to-[var(--surface-contrast)]`} />
        </div>

        <div className="[transform:translateZ(28px)]">
          <h3 className="text-xl font-bold tracking-tight text-[var(--foreground)] md:text-2xl">{product.name}</h3>
          <p className="mt-1 text-lg font-semibold text-primary md:text-xl">
            {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(product.price)}
          </p>
        </div>

        <div className="mt-4 flex justify-between border-t border-[var(--border-subtle)] pt-4 font-mono text-xs text-secondary transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100 [transform:translateZ(18px)]">
          <span>{product.technicalSpecs.battery || "4500mAh"}</span>
          <span>{product.technicalSpecs.storage || "128GB"}</span>
          <span>{product.technicalSpecs.ram || "8GB"}</span>
        </div>

        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 [transform:translateZ(40px)]">
          <a
            href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
            className="rounded-full border border-primary/20 bg-[var(--surface-contrast)] p-2 text-primary backdrop-blur-md transition-colors hover:bg-primary/30"
            onClick={(event) => event.stopPropagation()}
          >
            <MessageCircle size={20} />
          </a>
          <div onClick={(event) => event.stopPropagation()}>
            <CompareButton product={product} />
          </div>
        </div>
      </motion.div>
    </Tilt3D>
  );
}
