"use client";

import { MapPin, Mail, Phone, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-5xl">Contact Us</h1>
      <p className="text-secondary text-lg mb-12 max-w-2xl">
        Experiencing issues with an order or just want to chat gadgets? Drop us a line and our dedicated team will get back to you as soon as possible.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-full bg-[var(--surface-card)] p-3 text-primary"><MapPin /></div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">HQ Office</h3>
              <p className="text-secondary">12 Tech Avenue, G.R.A,<br/>Asaba, Delta State 320213, Nigeria</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-full bg-[var(--surface-card)] p-3 text-primary"><Phone /></div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Phone & WhatsApp</h3>
              <p className="text-secondary">+234 (0) 800 000 0000<br/>+234 (0) 801 111 1111</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-full bg-[var(--surface-card)] p-3 text-primary"><Mail /></div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Email Support</h3>
              <p className="text-secondary">support@fiscogadgets.com.ng<br/>sales@fiscogadgets.com.ng</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="shrink-0 rounded-full bg-[var(--surface-card)] p-3 text-primary"><Clock /></div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Operating Hours</h3>
              <p className="text-secondary">Monday - Saturday: 8:00 AM - 6:00 PM<br/>Sundays: Closed</p>
            </div>
          </div>
        </div>

        <div className="rounded-standard border border-border-subtle bg-[var(--surface-card)] p-8">
          <h3 className="mb-6 text-2xl font-bold text-[var(--foreground)]">Send a Message</h3>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">Your Name</label>
              <input type="text" id="name" className="w-full rounded-md border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors focus:border-primary focus:outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">Email Address</label>
              <input type="email" id="email" className="w-full rounded-md border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors focus:border-primary focus:outline-none" placeholder="john@example.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-secondary mb-1">Message</label>
              <textarea id="message" rows={5} className="w-full rounded-md border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors focus:border-primary focus:outline-none" placeholder="How can we help?"></textarea>
            </div>
            <button type="button" className="w-full bg-primary text-black hover:bg-emerald-400 text-base py-3 rounded-md font-bold transition-colors mt-4">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
