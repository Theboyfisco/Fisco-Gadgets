"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldUser } from "lucide-react";
import { loginCustomer } from "@/actions/customer-auth";

export function CustomerLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginCustomer({ email, password });
    if (!result.success) {
      setError(result.error || "Unable to sign in.");
      setLoading(false);
      return;
    }

    router.replace("/account/orders");
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-14">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-6 shadow-[0_22px_70px_rgba(8,18,38,0.12)]"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          <ShieldUser size={14} className="text-primary" />
          Customer account
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Sign in</h1>
        <p className="mt-2 text-sm text-secondary">Track orders, sync wishlist, compare, and recently viewed products.</p>

        <label className="mt-6 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
            placeholder="you@example.com"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
            placeholder="Your password"
          />
        </label>

        {error && <p className="mt-4 text-sm font-semibold text-[var(--status-error)]">{error}</p>}

        <button
          type="submit"
          disabled={!email || !password || loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-[var(--primary-contrast)] shadow-glow transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Continue"}
          <ArrowRight size={16} />
        </button>

        <p className="mt-4 text-sm text-secondary">
          No account yet?{" "}
          <Link href="/account/register" className="text-primary hover:text-[var(--primary-hover)]">
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}
