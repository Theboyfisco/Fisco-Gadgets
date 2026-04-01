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
            className="w-full overflow-hidden rounded-[1.75rem] border border-border-subtle bg-[linear-gradient(180deg,var(--panel-bg),var(--surface-card))] shadow-glass backdrop-blur-xl"
        >
            <div className="overflow-x-auto">
                <table className="min-w-[500px] w-full text-left text-sm text-secondary md:min-w-full">
                <thead className="border-b border-border-subtle bg-[var(--surface-card)] backdrop-blur-md">
                    <tr>
                        <th className="p-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-soft)]">Feature</th>
                        <th className="p-4 text-base font-semibold text-[var(--foreground)]">{productA.name}</th>
                        <th className="p-4 text-base font-semibold text-[var(--foreground)]">{productB.name}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-mono text-xs sm:text-sm">
                    {specs.map((spec) => (
                        <tr key={spec} className="transition-colors hover:bg-[var(--surface-card)]">
                            <td className="p-4 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">{spec.replace(/([A-Z])/g, ' $1').trim()}</td>
                            <td className="p-4 text-[var(--foreground)]">{productA.technicalSpecs[spec] || '-'}</td>
                            <td className="p-4 text-[var(--foreground)]">{productB.technicalSpecs[spec] || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </motion.div>
    );
}
