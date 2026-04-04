"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";
import { registerCustomer } from "@/actions/customer-auth";

export function CustomerRegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await registerCustomer({ fullName, email, password });
    if (!result.success) {
      setError(result.error || "Unable to create account.");
      setLoading(false);
      return;
    }

    router.replace("/account/profile");
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-14">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-6 shadow-[0_22px_70px_rgba(var(--shadow-neutral-rgb),0.12)]"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          <UserPlus size={14} className="text-primary" />
          New customer
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Create account</h1>
        <p className="mt-2 text-sm text-secondary">Save your products, track deliveries, and continue shopping across devices.</p>

        <label className="mt-6 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Full name</span>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
            placeholder="John Doe"
          />
        </label>

        <label className="mt-4 block">
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
            placeholder="At least 8 characters"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
            placeholder="Repeat password"
          />
        </label>

        {error && <p className="mt-4 text-sm font-semibold text-[var(--status-error)]">{error}</p>}

        <button
          type="submit"
          disabled={!email || !password || !confirmPassword || loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-[var(--primary-contrast)] shadow-glow transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create account"}
          <ArrowRight size={16} />
        </button>

        <p className="mt-4 text-sm text-secondary">
          Already have an account?{" "}
          <Link href="/account/login" className="text-primary hover:text-[var(--primary-hover)]">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}


