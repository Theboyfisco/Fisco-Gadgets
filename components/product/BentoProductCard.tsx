"use client";

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { CompareButton } from './CompareButton';

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

export function BentoProductCard({ product, featured = false }: BentoProductCardProps) {
    const whatsappMsg = encodeURIComponent(`Hi, I'm interested in the ${product.name} listed for ₦${product.price}`);

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className={`relative group p-4 border rounded-${featured ? 'featured' : 'standard'} border-border-subtle bg-surface backdrop-blur-md overflow-hidden ${featured ? 'md:col-span-2 shadow-glow' : ''}`}
        >
            <div className={`relative w-full mb-4 ${featured ? 'h-64' : 'h-48'}`}>
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover rounded-md"
                    placeholder={product.blurHash ? "blur" : "empty"}
                    blurDataURL={product.blurHash}
                />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">{product.name}</h3>
            <p className="text-xl font-semibold text-primary mt-1">
                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.price)}
            </p>

            {/* Quick Specs Reveal */}
            <div className={`mt-4 pt-4 border-t border-white/5 font-mono text-xs text-secondary flex justify-between lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300`}>
                <span>{product.technicalSpecs.battery || "4500mAh"}</span>
                <span>{product.technicalSpecs.storage || "128GB"}</span>
                <span>{product.technicalSpecs.ram || "8GB"}</span>
            </div>

            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <a
                    href={`https://wa.me/2348000000000?text=${whatsappMsg}`}
                    className="p-2 bg-primary/20 hover:bg-primary/40 text-primary rounded-full backdrop-blur-md transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MessageCircle size={20} />
                </a>
                <div onClick={(e) => e.stopPropagation()}>
                    <CompareButton product={product} />
                </div>
            </div>
        </motion.div>
    );
}
