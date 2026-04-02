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
    variant?: "default" | "dock";
}

export function CompareButton({ product, className = "", showLabel = false, variant = "default" }: CompareButtonProps) {
    const { addToCompare, removeFromCompare, isInCompare } = useCompare();
    const { pushToast } = useToast();
    const active = isInCompare(product.id);
    const isDock = variant === "dock";

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
            className={`flex items-center gap-2 transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] ${
                isDock
                    ? active
                        ? "text-primary"
                        : "text-[var(--foreground)]"
                    : active
                        ? "text-primary"
                        : "text-secondary hover:text-[var(--foreground)]"
            } ${className}`}
            title={active ? "Remove from comparison" : "Add to comparison"}
        >
            <motion.div
                whileTap={{ scale: 0.8 }}
                className={`inline-flex items-center justify-center border shadow-[0_12px_30px_rgba(8,18,38,0.12)] transition-colors duration-[var(--motion-base)] ease-[var(--ease-standard)] ${
                    isDock
                        ? active
                            ? "h-10 w-10 rounded-xl border-primary/40 bg-primary/18"
                            : "h-10 w-10 rounded-xl border-[var(--interactive-border)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-active)]"
                        : active
                            ? "rounded-full border-primary/30 bg-primary/20 p-2"
                            : "rounded-full border-[var(--border-subtle)] bg-[var(--surface-card)] p-2"
                }`}
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
