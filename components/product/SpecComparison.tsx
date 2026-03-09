"use client";

import { type Product } from './BentoProductCard';
import { motion } from 'framer-motion';

export function SpecComparison({ productA, productB }: { productA: Product; productB: Product }) {
    // Common specs to compare based on what exists
    const specs = Array.from(new Set([
        ...Object.keys(productA.technicalSpecs),
        ...Object.keys(productB.technicalSpecs)
    ]));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full overflow-hidden rounded-standard border border-border-subtle bg-[var(--panel-bg)] shadow-glass"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-secondary min-w-[500px] md:min-w-full">
                <thead className="border-b border-border-subtle bg-[var(--surface-card)] backdrop-blur-md">
                    <tr>
                        <th className="p-4 font-medium uppercase tracking-wider text-xs">Feature</th>
                        <th className="p-4 text-base font-medium text-[var(--foreground)]">{productA.name}</th>
                        <th className="p-4 text-base font-medium text-[var(--foreground)]">{productB.name}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-mono text-xs sm:text-sm">
                    {specs.map((spec) => (
                        <tr key={spec} className="transition-colors hover:bg-[var(--surface-card)]">
                            <td className="p-4 capitalize font-sans font-medium">{spec.replace(/([A-Z])/g, ' $1').trim()}</td>
                            <td className="p-4">{productA.technicalSpecs[spec] || '-'}</td>
                            <td className="p-4">{productB.technicalSpecs[spec] || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </motion.div>
    );
}
