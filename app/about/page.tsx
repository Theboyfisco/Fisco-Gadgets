"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <Reveal>
      <div className="mx-auto mb-16 max-w-4xl rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-8 text-center shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-5xl">Redefining Tech Retail in Nigeria</h1>
        <p className="text-secondary text-lg">
          NOXTECH was founded with a single mission: to provide Nigerians with authentic, premium gadgets without the typical associated hassle, stress, or inflated costs.
        </p>
      </div>
      </Reveal>

      <Reveal delay={0.05}>
      <div className="relative mb-16 h-64 w-full overflow-hidden rounded-[2rem] border border-border-subtle shadow-[0_24px_80px_rgba(8,18,38,0.14)] md:h-96">
        <Image 
          src="https://images.unsplash.com/photo-1550935569-450f32b1d3d6?q=80&w=1200&auto=format&fit=crop"
          alt="NOXTECH Office"
          fill
          className="object-cover"
        />
      </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <Reveal delay={0.08}>
        <div className="rounded-[1.75rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/30">
          <h3 className="text-4xl font-black text-primary mb-2">10k+</h3>
          <p className="mb-2 font-bold text-[var(--foreground)]">Happy Customers</p>
          <p className="text-secondary text-sm">Delivered nationwide with a 98% satisfaction rate.</p>
        </div>
        </Reveal>
        <Reveal delay={0.12}>
        <div className="rounded-[1.75rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/30">
          <h3 className="text-4xl font-black text-primary mb-2">100%</h3>
          <p className="mb-2 font-bold text-[var(--foreground)]">Authentic Products</p>
          <p className="text-secondary text-sm">We source directly from verified suppliers and manufacturers.</p>
        </div>
        </Reveal>
        <Reveal delay={0.16}>
        <div className="rounded-[1.75rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-glass/30">
          <h3 className="text-4xl font-black text-primary mb-2">24/7</h3>
          <p className="mb-2 font-bold text-[var(--foreground)]">Dedicated Support</p>
          <p className="text-secondary text-sm">Our tech experts are always on standby to guide you.</p>
        </div>
        </Reveal>
      </div>
    </div>
  );
}
