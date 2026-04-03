"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SUPPORT_EMAIL } from "@/lib/support-config";

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1 max-w-3xl">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <Reveal>
        <div className="mb-10 rounded-[2rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/30">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-cta)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            <RefreshCcw size={14} /> Returns
          </div>
          <h1 className="mb-3 text-4xl font-extrabold text-[var(--foreground)]">Returns & Refunds</h1>
          <p className="text-sm text-secondary">Built to keep your purchase risk‑free.</p>
        </div>
      </Reveal>

      <div className="space-y-6 text-secondary">
        <Reveal>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">7-Day Return Policy</h2>
            <p className="mb-4">We offer a 7-day return window for products that are factory-defective. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging with all seals intact.</p>
            <p>Items purchased under &quot;Open Box&quot; or &quot;Refurbished&quot; tags have a separate assessment criteria listed in your receipt.</p>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Process a Return</h2>
            <p className="mb-4">To initiate a return, immediately contact our support via WhatsApp or email ({SUPPORT_EMAIL}). Do not ship items back without a Return Authorization number provided by our team.</p>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Refunds</h2>
            <p>Once we receive and inspect your item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed to the original method of payment within 3-5 business days.</p>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
