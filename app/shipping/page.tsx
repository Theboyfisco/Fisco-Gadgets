"use client";

import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1 max-w-3xl">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <Reveal>
        <div className="mb-10 rounded-2xl border border-border-subtle bg-[var(--surface-card)] p-6 shadow-glass/30">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-cta)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            <Truck size={14} /> Shipping
          </div>
          <h1 className="mb-3 text-4xl font-extrabold text-[var(--foreground)]">Shipping Policy</h1>
          <p className="text-sm text-secondary">Fast, tracked delivery across Nigeria.</p>
        </div>
      </Reveal>

      <div className="space-y-6 text-secondary">
        <Reveal>
          <section className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Delivery Times</h2>
            <p className="mb-4">We pride ourselves on lightning-fast delivery across Nigeria. Delivery estimates depend on your location:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-primary">Asaba & Environs:</strong> Same day delivery for orders placed before 2 PM. Orders placed after 2 PM will arrive the next morning.</li>
              <li><strong className="text-[var(--foreground)]">Lagos, Abuja, PH:</strong> 1-2 business days.</li>
              <li><strong className="text-[var(--foreground)]">Other Locations in Nigeria:</strong> 2-4 business days.</li>
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Shipping Costs</h2>
            <p>Shipping fees are automatically calculated at checkout based on the delivery distance. Free delivery is available for orders exceeding ₦2,000,000 within Asaba.</p>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Order Tracking</h2>
            <p>Once your order has been dispatched, you will receive an automatic email and SMS containing your tracking number and expected delivery timeframe.</p>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
