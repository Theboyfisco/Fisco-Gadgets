"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "./BrandLogo";
import { SUPPORT_EMAIL } from "@/lib/support-config";

interface FooterProps {
  categories?: { id: string; name: string; slug?: string }[];
}

const COPYRIGHT_YEAR = 2026;

export function Footer({ categories = [] }: FooterProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="mt-auto w-full border-t border-[var(--border-subtle)] bg-[var(--footer-bg)] pt-[clamp(2.5rem,5vw,4.5rem)]">
      <div className="container mx-auto">
        <div className="mb-[clamp(2rem,3.6vw,3rem)] rounded-[clamp(1.2rem,2vw,2rem)] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--footer-panel),var(--surface-soft))] p-[clamp(1rem,2vw,2rem)] shadow-[0_24px_80px_rgba(8,18,38,0.12)] backdrop-blur-xl">
          <div className="grid grid-cols-1 gap-[clamp(1rem,2vw,2rem)] md:grid-cols-2 xl:grid-cols-4">
            <div className="lg:col-span-2">
              <BrandLogo className="mb-4" />
              <p className="text-muted max-w-md text-sm leading-relaxed">
                Clean, trusted gadget shopping for Nigeria with authentic devices, transparent pricing, and quick delivery.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="text-muted rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs">100% Authentic Devices</div>
                <div className="text-muted rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs">Fast Nationwide Shipping</div>
                <div className="text-muted rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs">Secure Checkout</div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Categories</h3>
              <ul className="space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link href={`/category/${category.slug ?? category.id}`} className="interactive-focus text-muted link-accent text-sm transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/brand/apple" className="interactive-focus text-muted link-accent text-sm transition-colors">
                    Apple Store
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="interactive-focus text-muted link-accent text-sm transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="interactive-focus text-muted link-accent text-sm transition-colors">
                    Contact & Support
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="interactive-focus text-muted link-accent text-sm transition-colors">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="interactive-focus text-muted link-accent text-sm transition-colors">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="interactive-focus text-muted link-accent text-sm transition-colors">
                    Warranty Information
                  </Link>
                </li>
                <li>
                  <Link href="/admin/products" className="interactive-focus text-muted link-accent text-sm transition-colors">
                    Admin Console
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-[clamp(1.8rem,3vw,2.5rem)] grid grid-cols-1 gap-[clamp(1rem,2vw,1.8rem)] lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-soft),var(--surface-card))] p-5 shadow-[0_18px_44px_rgba(8,18,38,0.08)]">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Join Updates</h3>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
              >
                <CheckCircle2 size={16} />
                You&apos;re on the list.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="interactive-focus w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-cta)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--text-soft)] focus:border-[var(--interactive-border-strong)] focus-visible:ring-2 focus-visible:ring-primary/25"
                />
                <button
                  type="submit"
                  className="interactive-focus primary-action rounded-full px-4 py-2 text-sm font-semibold transition-colors sm:min-w-[7rem]"
                >
                  Join
                </button>
              </form>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-soft),var(--surface-card))] p-5 shadow-[0_18px_44px_rgba(8,18,38,0.08)]">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Contact</h3>
            <ul className="space-y-3">
              <li className="text-muted flex items-start gap-2 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>12 Tech Avenue, G.R.A, Asaba, Delta State 320213</span>
              </li>
              <li className="text-muted flex items-center gap-2 text-sm">
                <Phone size={16} className="shrink-0 text-primary" />
                <span>+234 (0) 800 000 0000</span>
              </li>
              <li className="text-muted flex items-center gap-2 text-sm">
                <Mail size={16} className="shrink-0 text-primary" />
                <span>{SUPPORT_EMAIL}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-soft),var(--surface-card))] p-5 shadow-[0_18px_44px_rgba(8,18,38,0.08)]">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Social</h3>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="interactive-focus rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-2 text-secondary transition-all hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-hover)] hover:text-primary">
                <Facebook size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="interactive-focus rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-2 text-secondary transition-all hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-hover)] hover:text-primary">
                <Twitter size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="interactive-focus rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-2 text-secondary transition-all hover:border-[var(--interactive-border-strong)] hover:bg-[var(--interactive-hover)] hover:text-primary">
                <Instagram size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="text-muted flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] py-6 text-center text-sm md:flex-row md:text-left">
          <p>© {COPYRIGHT_YEAR} NOXTECH. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="interactive-focus transition-colors hover:text-[var(--foreground)]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="interactive-focus transition-colors hover:text-[var(--foreground)]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

