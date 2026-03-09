"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-5xl">Redefining Tech Retail in Nigeria</h1>
        <p className="text-secondary text-lg">
          Fisco Gadgets was founded with a single mission: to provide Nigerians with authentic, premium gadgets without the typical associated hassle, stress, or inflated costs.
        </p>
      </div>

      <div className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden mb-16 border border-border-subtle">
        <Image 
          src="https://images.unsplash.com/photo-1550935569-450f32b1d3d6?q=80&w=1200&auto=format&fit=crop"
          alt="Fisco Gadgets Office"
          fill
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <div className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6">
          <h3 className="text-4xl font-black text-primary mb-2">10k+</h3>
          <p className="mb-2 font-bold text-[var(--foreground)]">Happy Customers</p>
          <p className="text-secondary text-sm">Delivered nationwide with a 98% satisfaction rate.</p>
        </div>
        <div className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6">
          <h3 className="text-4xl font-black text-primary mb-2">100%</h3>
          <p className="mb-2 font-bold text-[var(--foreground)]">Authentic Products</p>
          <p className="text-secondary text-sm">We source directly from verified suppliers and manufacturers.</p>
        </div>
        <div className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-6">
          <h3 className="text-4xl font-black text-primary mb-2">24/7</h3>
          <p className="mb-2 font-bold text-[var(--foreground)]">Dedicated Support</p>
          <p className="text-secondary text-sm">Our tech experts are always on standby to guide you.</p>
        </div>
      </div>
    </div>
  );
}
