"use client";

import { MapPin, Mail, Phone, Clock, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { useToast } from "@/components/ui/ToastProvider";

export function ContactPageClient({ initialMessage = "" }: { initialMessage?: string }) {
  const { pushToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: initialMessage });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    pushToast({
      title: "Message sent",
      description: "We will reply within 24 hours.",
      variant: "success",
    });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1">
      <Link href="/" className="group mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2 text-secondary transition-colors hover:text-[var(--foreground)]">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <Reveal>
        <div className="mb-12 max-w-3xl rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-8 shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-5xl">Contact Us</h1>
          <p className="text-secondary text-lg">
            Experiencing issues with an order or just want to chat gadgets? Drop us a line and our dedicated team will get back to you as soon as possible.
          </p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Reveal>
            <div className="flex items-start gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-5">
            <div className="shrink-0 rounded-full bg-[var(--surface-card)] p-3 text-primary"><MapPin /></div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">HQ Office</h3>
              <p className="text-secondary">12 Tech Avenue, G.R.A,<br/>Asaba, Delta State 320213, Nigeria</p>
            </div>
          </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="flex items-start gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-5">
            <div className="shrink-0 rounded-full bg-[var(--surface-card)] p-3 text-primary"><Phone /></div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Phone & WhatsApp</h3>
              <p className="text-secondary">+234 (0) 800 000 0000<br/>+234 (0) 801 111 1111</p>
            </div>
          </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex items-start gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-5">
            <div className="shrink-0 rounded-full bg-[var(--surface-card)] p-3 text-primary"><Mail /></div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Email Support</h3>
              <p className="text-secondary">support@noxtech.com.ng<br/>sales@noxtech.com.ng</p>
            </div>
          </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="flex items-start gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-5">
            <div className="shrink-0 rounded-full bg-[var(--surface-card)] p-3 text-primary"><Clock /></div>
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Operating Hours</h3>
              <p className="text-secondary">Monday - Saturday: 8:00 AM - 6:00 PM<br/>Sundays: Closed</p>
            </div>
          </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-[2rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-8 shadow-glass/40">
          <h3 className="mb-6 text-2xl font-bold text-[var(--foreground)]">Send a Message</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors placeholder:text-[var(--text-soft)] focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors placeholder:text-[var(--text-soft)] focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-secondary mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors placeholder:text-[var(--text-soft)] focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                placeholder="How can we help?"
              ></textarea>
            </div>
            <button type="submit" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-base font-bold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)]">
              <Send size={18} />
              Send Message
            </button>
          </form>
        </div>
        </Reveal>
      </div>
    </div>
  );
}
