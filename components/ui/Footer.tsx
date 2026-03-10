"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface FooterProps {
  categories?: { id: string; name: string }[];
}

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
    <footer className="mt-auto w-full border-t border-[var(--border-subtle)] bg-[var(--footer-bg)] pt-14">
      <div className="container mx-auto px-4">
        <div className="mb-12 rounded-2xl border border-[var(--border-subtle)] bg-[var(--footer-panel)] p-6 md:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link
                href="/"
                className="mb-4 inline-block bg-gradient-to-r from-cyan-200 via-sky-300 to-violet-300 bg-clip-text text-2xl font-extrabold text-transparent"
              >
                Fisco Gadgets
              </Link>
              <p className="max-w-md text-sm leading-relaxed text-secondary">
                Clean, trusted gadget shopping for Nigeria with authentic devices, transparent pricing, and quick delivery.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-secondary">100% Authentic Devices</div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-secondary">Fast Nationwide Shipping</div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-secondary">Secure Checkout</div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Categories</h3>
              <ul className="space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link href={`/category/${category.id}`} className="text-sm text-secondary transition-colors hover:text-primary">
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/brand/apple" className="text-sm text-secondary transition-colors hover:text-primary">
                    Apple Store
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-sm text-secondary transition-colors hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-secondary transition-colors hover:text-primary">
                    Contact & Support
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-sm text-secondary transition-colors hover:text-primary">
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-sm text-secondary transition-colors hover:text-primary">
                    Returns & Refunds
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="text-sm text-secondary transition-colors hover:text-primary">
                    Warranty Information
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Join Updates</h3>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary"
              >
                <CheckCircle2 size={16} />
                You&apos;re on the list.
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-cta)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-primary"
                />
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-cyan-200"
                >
                  Join
                </button>
              </form>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-secondary">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" />
                <span>12 Tech Avenue, G.R.A, Asaba, Delta State 320213</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-secondary">
                <Phone size={16} className="shrink-0 text-primary" />
                <span>+234 (0) 800 000 0000</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-secondary">
                <Mail size={16} className="shrink-0 text-primary" />
                <span>support@fiscogadgets.com.ng</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">Social</h3>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-2 text-secondary transition-all hover:border-primary/30 hover:text-primary">
                <Facebook size={16} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-2 text-secondary transition-all hover:border-primary/30 hover:text-primary">
                <Twitter size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-2 text-secondary transition-all hover:border-primary/30 hover:text-primary">
                <Instagram size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] py-6 text-sm text-secondary md:flex-row">
          <p>© {new Date().getFullYear()} Fisco Gadgets. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-[var(--foreground)]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-[var(--foreground)]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
