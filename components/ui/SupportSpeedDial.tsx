"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CircleHelp, Mail, MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MOTION } from "@/lib/motion";
import { useToast } from "@/components/ui/ToastProvider";
import { SUPPORT_EMAIL, buildWhatsAppLink } from "@/lib/support-config";

type SupportFormState = {
  name: string;
  email: string;
  orderRef: string;
  message: string;
};

const INITIAL_FORM: SupportFormState = {
  name: "",
  email: "",
  orderRef: "",
  message: "",
};

export function SupportSpeedDial() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<SupportFormState>(INITIAL_FORM);
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { pushToast } = useToast();

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const updateField = (field: keyof SupportFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();
    const trimmedOrderRef = form.orderRef.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      pushToast({
        title: "Missing details",
        description: "Name, email, and message are required.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          orderRef: trimmedOrderRef || undefined,
          message: trimmedMessage,
          path: typeof window === "undefined" ? undefined : window.location.pathname,
          website: "",
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to send message");
      }

      setForm(INITIAL_FORM);
      setIsOpen(false);
      pushToast({
        title: "Message sent",
        description: "Support has received your message and will reply shortly.",
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again, or use WhatsApp for immediate support.";
      pushToast({
        title: "Send failed",
        description: message,
        variant: "warning",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickActions = [
    {
      id: "whatsapp",
      href: buildWhatsAppLink("Hi NOXtech support, I need help with my order."),
      label: "WhatsApp",
      icon: MessageCircle,
      iconClass: "text-[#25D366]",
      external: true,
    },
    {
      id: "email",
      href: `mailto:${SUPPORT_EMAIL}`,
      label: "Email",
      icon: Mail,
      iconClass: "text-[#4f6de4]",
      external: false,
    },
    {
      id: "faq",
      href: "/contact",
      label: "FAQ / Live Help",
      icon: CircleHelp,
      iconClass: "text-primary",
      external: false,
    },
  ] as const;

  return (
    <div
      ref={rootRef}
      className="fixed right-[max(1rem,env(safe-area-inset-right))] bottom-[max(5.25rem,env(safe-area-inset-bottom))] z-[80] sm:right-6 sm:bottom-6"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.section
            id="support-widget-panel"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
            className="mb-3 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-[1.3rem] border border-[var(--support-menu-border)] bg-[var(--support-menu-bg)] shadow-[var(--support-menu-shadow)] backdrop-blur-2xl max-[380px]:w-[calc(100vw-1rem)]"
            aria-label="Support panel"
          >
            <div className="flex items-start justify-between border-b border-[var(--support-menu-border)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Need help?</p>
                <p className="text-xs text-secondary">We usually reply within minutes.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="interactive-focus inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--support-menu-item-border)] bg-[var(--support-menu-item-bg)] text-secondary transition-colors hover:bg-[var(--support-menu-item-hover)] hover:text-[var(--foreground)]"
                aria-label="Close support panel"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 px-4 py-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const baseClassName =
                  "inline-flex w-full items-center gap-2.5 rounded-xl border border-[var(--support-menu-item-border)] bg-[var(--support-menu-item-bg)] px-3 py-2.5 text-sm transition-colors hover:bg-[var(--support-menu-item-hover)]";

                const motionProps = {
                  initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 8, scale: 0.98 },
                  animate: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 },
                  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 6, scale: 0.98 },
                  transition: {
                    duration: MOTION.duration.fast,
                    ease: MOTION.ease.standard,
                    delay: prefersReducedMotion ? 0 : index * 0.05,
                  },
                };

                const content = (
                  <>
                    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--support-menu-item-bg)] ${action.iconClass}`}>
                      <Icon size={16} />
                    </span>
                    <span className="font-medium text-[var(--foreground)]">{action.label}</span>
                  </>
                );

                if (action.href.startsWith("/")) {
                  return (
                    <Link key={action.id} href={action.href} onClick={() => setIsOpen(false)} className="block">
                      <motion.span className={baseClassName} {...motionProps}>
                        {content}
                      </motion.span>
                    </Link>
                  );
                }

                return (
                  <motion.a
                    key={action.id}
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    className={baseClassName}
                    {...motionProps}
                  >
                    {content}
                  </motion.a>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-[var(--support-menu-border)] px-4 py-3">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Send message</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  minLength={1}
                  placeholder="Your name"
                  className="w-full rounded-xl border border-[var(--support-menu-item-border)] bg-[var(--support-menu-item-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)] focus:border-[var(--interactive-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-[var(--support-menu-item-border)] bg-[var(--support-menu-item-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)] focus:border-[var(--interactive-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <input
                  type="text"
                  value={form.orderRef}
                  onChange={(event) => updateField("orderRef", event.target.value)}
                  placeholder="Order reference (optional)"
                  className="w-full rounded-xl border border-[var(--support-menu-item-border)] bg-[var(--support-menu-item-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)] focus:border-[var(--interactive-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(event) => updateField("message", event.target.value)}
                  minLength={3}
                  placeholder="Tell us what you need help with"
                  className="w-full resize-none rounded-xl border border-[var(--support-menu-item-border)] bg-[var(--support-menu-item-bg)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)] focus:border-[var(--interactive-border-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--support-fab-border)] px-3 py-2.5 text-sm font-semibold text-[var(--support-fab-foreground)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: "var(--support-fab-bg)", boxShadow: "var(--support-fab-shadow)" }}
                >
                  <Send size={16} />
                  {isSubmitting ? "Sending..." : "Send to support"}
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="support-widget-panel"
        aria-label={isOpen ? "Close support widget" : "Open support widget"}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
        animate={isOpen && !prefersReducedMotion ? { rotate: 12 } : { rotate: 0 }}
        transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
        className="interactive-focus flex h-12 w-12 items-center justify-center rounded-full border text-[var(--support-fab-foreground)] max-[380px]:h-11 max-[380px]:w-11 sm:h-14 sm:w-14"
        style={{
          background: "var(--support-fab-bg)",
          borderColor: "var(--support-fab-border)",
          boxShadow: "var(--support-fab-shadow)",
        }}
      >
        <MessageCircle size={22} />
      </motion.button>
    </div>
  );
}
