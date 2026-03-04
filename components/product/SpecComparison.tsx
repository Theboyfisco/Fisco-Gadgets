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
            className="w-full border border-border-subtle rounded-standard bg-base shadow-glass overflow-hidden"
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-secondary min-w-[500px] md:min-w-full">
                <thead className="bg-white/5 border-b border-border-subtle backdrop-blur-md">
                    <tr>
                        <th className="p-4 font-medium uppercase tracking-wider text-xs">Feature</th>
                        <th className="p-4 font-medium text-white text-base">{productA.name}</th>
                        <th className="p-4 font-medium text-white text-base">{productB.name}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle font-mono text-xs sm:text-sm">
                    {specs.map((spec) => (
                        <tr key={spec} className="hover:bg-white/5 transition-colors">
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
