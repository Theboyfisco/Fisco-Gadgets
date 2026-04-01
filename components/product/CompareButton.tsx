"use client";

import { useCompare } from "./CompareProvider";
import type { Product } from "./BentoProductCard";
import { Scale } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";

interface CompareButtonProps {
    product: Product;
    className?: string;
    showLabel?: boolean;
}

export function CompareButton({ product, className = "", showLabel = false }: CompareButtonProps) {
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const { pushToast } = useToast();
    const active = isInCompare(product.id);

    const toggleCompare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (active) {
            removeFromCompare(product.id);
            pushToast({
                title: "Removed from compare",
                description: product.name,
                variant: "info",
            });
        } else {
            addToCompare(product);
            pushToast({
                title: "Added to compare",
                description: product.name,
                variant: "success",
            });
        }
    };

    return (
        <button
            onClick={toggleCompare}
            aria-pressed={active}
            aria-label={active ? `Remove ${product.name} from comparison` : `Add ${product.name} to comparison`}
            className={`flex items-center gap-2 transition-all duration-300 ${active ? "text-primary" : "text-secondary hover:text-[var(--foreground)]"} ${className}`}
            title={active ? "Remove from comparison" : "Add to comparison"}
        >
            <motion.div
                whileTap={{ scale: 0.8 }}
                className={`rounded-full border p-2 shadow-[0_12px_30px_rgba(8,18,38,0.12)] ${active ? "border-primary/30 bg-primary/20" : "border-[var(--border-subtle)] bg-[var(--surface-card)]"}`}
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
