"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const LAST_UPDATED = "April 1, 2026";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex-1 max-w-3xl">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <Reveal>
        <div className="mb-10 rounded-[2rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/30">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-cta)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            <FileText size={14} /> Terms of Service
          </div>
          <h1 className="mb-3 text-4xl font-extrabold text-[var(--foreground)]">Our terms in plain language</h1>
          <p className="text-sm text-secondary">Last updated: {LAST_UPDATED}</p>
        </div>
      </Reveal>

      <div className="space-y-6 text-secondary">
        <Reveal>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">1. Acceptance of Terms</h2>
            <p>By accessing or using NOXTECH, you agree to be bound by these terms. If you disagree, you may not access our store and services.</p>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">2. Product Descriptions</h2>
            <p>We strive to be as accurate as possible in pricing and product descriptions. However, we do not warrant that product descriptions or other content are error-free. Errors in pricing will be corrected before payment capture.</p>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">3. Fraud Prevention</h2>
            <p>NOXTECH reserves the right to cancel orders flagged as high risk by our payment partners. In such cases, full refunds are issued to the source account.</p>
          </section>
        </Reveal>

        <Reveal delay={0.15}>
          <section className="rounded-[1.5rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">4. Limitation of Liability</h2>
            <p>We are not liable for indirect or consequential losses arising out of your use of our products. Our maximum liability shall not exceed the purchase price of the physical item.</p>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
