"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight } from "lucide-react";
import { loginAdmin } from "@/actions/admin-auth";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const result = await loginAdmin(username, password);
    if (!result.success) {
      setError(result.error || "Login failed");
      setLoading(false);
      return;
    }

    router.replace("/admin/products");
  };

  return (
    <div className="container mx-auto flex min-h-[70vh] items-center justify-center px-4 py-20">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-[0_18px_60px_rgba(var(--shadow-neutral-rgb),0.12)]"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
          <Shield size={14} className="text-primary" />
          Admin access
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Sign in to manage inventory</h1>
        <p className="mt-2 text-sm text-secondary">Sign in with your admin username and password.</p>

        <label className="mt-6 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
            Username
          </span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
            placeholder="admin"
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
            placeholder="********"
          />
        </label>

        {error && <p className="mt-4 text-sm font-semibold text-[var(--status-error)]">{error}</p>}

        <div className="mt-4 text-sm text-secondary">
          No admin yet?{" "}
          <Link href="/admin/setup" className="text-primary hover:text-[var(--primary-hover)]">
            Create the first admin
          </Link>
        </div>

        <button
          type="submit"
          disabled={!username || !password || loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-semibold text-[var(--primary-contrast)] shadow-glow transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Continue"}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}

