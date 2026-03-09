"use client";

import { useCompare } from "./CompareProvider";
import type { Product } from "./BentoProductCard";
import { Scale } from "lucide-react";
import { motion } from "framer-motion";

interface CompareButtonProps {
    product: Product;
    className?: string;
    showLabel?: boolean;
}

export function CompareButton({ product, className = "", showLabel = false }: CompareButtonProps) {
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const active = isInCompare(product.id);

    const toggleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (active) {
            removeFromCompare(product.id);
        } else {
            addToCompare(product);
        }
    };

    return (
        <button
            onClick={toggleCompare}
            className={`flex items-center gap-2 transition-all duration-300 ${active ? "text-primary" : "text-secondary hover:text-[var(--foreground)]"} ${className}`}
            title={active ? "Remove from comparison" : "Add to comparison"}
        >
            <motion.div
                whileTap={{ scale: 0.8 }}
                className={`rounded-full border p-2 ${active ? "border-primary/30 bg-primary/20" : "border-[var(--border-subtle)] bg-[var(--surface-card)]"}`}
            >
                <Scale size={18} />
            </motion.div>
            {showLabel && (
                <span className="text-sm font-medium">
                    {active ? "Comparing" : "Compare"}
                </span>
            )}
        </button>
    );
}
