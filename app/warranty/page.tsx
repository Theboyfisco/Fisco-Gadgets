"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export default function WarrantyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1 max-w-3xl">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <Reveal>
        <div className="mb-10 rounded-[2rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/30">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-cta)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            <ShieldCheck size={14} /> Warranty
          </div>
          <h1 className="mb-3 text-4xl font-extrabold text-[var(--foreground)]">Warranty Information</h1>
          <p className="text-sm text-secondary">Coverage details for every purchase.</p>
        </div>
      </Reveal>

      <div className="space-y-6 text-secondary">
        <Reveal>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Manufacturer Warranty</h2>
            <p className="mb-4">All &quot;New&quot; products come with standard manufacturer warranties. For Apple devices, this typically means a 1-year global Apple warranty that can be claimed at any recognized service center.</p>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Store Guarantee</h2>
            <p className="mb-4">At Fisco Gadgets, we stand by our catalog. In addition to any manufacturer warranty, we offer a 6-month store guarantee on our refurbished units. If an issue arises from regular usage that is not linked to water damage or physical drops, we will repair it for free.</p>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">What&apos;s Not Covered</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accidental physical damages (broken screens, bent housing).</li>
              <li>Water or liquid damages (even if device is water-resistant).</li>
              <li>Battery degradation over normal use.</li>
              <li>Unauthorized repairs or software modification.</li>
            </ul>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
