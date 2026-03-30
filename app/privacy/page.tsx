"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex-1 max-w-3xl">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <Reveal>
        <div className="mb-10 rounded-2xl border border-border-subtle bg-[var(--surface-card)] p-6 shadow-glass/30">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-cta)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            <ShieldCheck size={14} /> Privacy Policy
          </div>
          <h1 className="mb-3 text-4xl font-extrabold text-[var(--foreground)]">How we protect your data</h1>
          <p className="text-sm text-secondary">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </Reveal>

      <div className="space-y-6 text-secondary">
        <Reveal>
          <section className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Information Collection</h2>
            <p>We collect personal data you provide directly to us when creating an account, making a purchase, subscribing to a newsletter, or communicating with us. This includes your name, shipping/billing address, email, and phone number.</p>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Payment Processing</h2>
            <p>We do not store complete credit card information on our servers. All sensitive financial data is encrypted and passed directly to secure payment gateways (like Paystack) in compliance with PCI-DSS.</p>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6 shadow-glass/20">
            <h2 className="mb-3 text-2xl font-bold text-[var(--foreground)]">Data Usage</h2>
            <p>We only use your information for order fulfillment, improving user experience, and occasionally sending marketing updates if you have opted in.</p>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
