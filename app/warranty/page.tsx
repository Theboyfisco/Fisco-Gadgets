"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WarrantyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1 max-w-3xl">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <h1 className="mb-8 text-4xl font-extrabold text-[var(--foreground)]">Warranty Information</h1>
      
      <div className="space-y-8 text-secondary">
        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">Manufacturer Warranty</h2>
          <p className="mb-4">All &quot;New&quot; products come with standard manufacturer warranties. For Apple devices, this typically means a 1-year global Apple warranty that can be claimed at any recognized service center.</p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">Store Guarantee</h2>
          <p className="mb-4">At Fisco Gadgets, we stand by our catalog. In addition to any manufacturer warranty, we offer a 6-month store guarantee on our refurbished units. If an issue arises from regular usage that is not linked to water damage or physical drops, we will repair it for free.</p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold text-[var(--foreground)]">What&apos;s Not Covered</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Accidental physical damages (broken screens, bent housing).</li>
            <li>Water or liquid damages (even if device is water-resistant).</li>
            <li>Battery degradation over normal use.</li>
            <li>Unauthorized repairs or software modification.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
