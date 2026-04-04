"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BellRing, Clock3, Heart, KeyRound, LogOut, Package, Save, Scale, ShieldCheck, ShoppingBag, UserCircle2 } from "lucide-react";
import { changeCustomerPassword, updateCustomerProfile } from "@/actions/customer-profile";

type ProfileOrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

type ProfileProps = {
  customer: {
    fullName: string | null;
    email: string;
    createdAtIso: string;
  };
  orderSummary: {
    totalOrders: number;
    activeOrders: number;
    paidOrders: number;
    cancelledOrders: number;
    totalSpent: number;
  };
  listSummary: {
    wishlist: number;
    compare: number;
    recent: number;
    savedForLater: number;
    cart: number;
  };
  recentOrders: Array<{
    id: string;
    status: ProfileOrderStatus;
    totalAmount: number;
    itemCount: number;
    createdAtIso: string;
  }>;
  latestShipping: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    shippingType: "LOCAL_PICKUP" | "DELIVERY";
  } | null;
};

function statusTone(status: ProfileOrderStatus) {
  if (status === "PAID") return "text-primary border-primary/30 bg-primary/10";
  if (status === "SHIPPED") return "text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10";
  if (status === "CANCELLED") return "text-[var(--status-error)] border-[var(--status-error)]/30 bg-[var(--status-error)]/10";
  return "text-secondary border-[var(--border-subtle)] bg-[var(--surface-soft)]";
}

export function CustomerProfileConsole({
  customer,
  orderSummary,
  listSummary,
  recentOrders,
  latestShipping,
}: ProfileProps) {
  const [fullName, setFullName] = useState(customer.fullName ?? "");
  const [profilePending, setProfilePending] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const customerInitials = useMemo(() => {
    const source = (fullName || customer.email).trim();
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "NT";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }, [customer.email, fullName]);

  const joinedLabel = new Date(customer.createdAtIso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const currency = useMemo(
    () =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
      }),
    [],
  );

  const submitProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfilePending(true);
    setProfileFeedback(null);
    setProfileError(null);

    const result = await updateCustomerProfile({ fullName });
    if (!result.success) {
      setProfileError(result.error || "Unable to update profile.");
      setProfilePending(false);
      return;
    }

    setProfileFeedback(result.message || "Profile updated.");
    setProfilePending(false);
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordPending(true);
    setPasswordFeedback(null);
    setPasswordError(null);

    const result = await changeCustomerPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      setPasswordError(result.error || "Unable to change password.");
      setPasswordPending(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordFeedback(result.message || "Password changed.");
    setPasswordPending(false);
  };

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <section className="mb-8 rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-6 shadow-[0_24px_70px_rgba(var(--shadow-neutral-rgb),0.14)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--interactive-border)] bg-[var(--surface-soft)] text-lg font-bold text-[var(--foreground)]">
              {customerInitials}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">My account</p>
              <h1 className="mt-1 text-3xl font-bold text-[var(--foreground)]">{fullName || "Customer profile"}</h1>
              <p className="mt-1 text-sm text-secondary">{customer.email}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-soft)]">Member since {joinedLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
            >
              <Package size={14} />
              Orders
            </Link>
            <Link
              href="/wishlist"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
            >
              <Heart size={14} />
              Wishlist
            </Link>
            <Link
              href="/account/logout"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
            >
              <LogOut size={14} />
              Sign out
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
            <div className="mb-4 flex items-center gap-2 text-[var(--foreground)]">
              <UserCircle2 size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Profile details</h2>
            </div>
            <form onSubmit={submitProfile} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Full name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="Your full name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Email (account ID)</span>
                <input
                  type="email"
                  value={customer.email}
                  disabled
                  className="w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-secondary"
                />
              </label>

              {profileError ? <p className="text-sm font-semibold text-[var(--status-error)]">{profileError}</p> : null}
              {profileFeedback ? <p className="text-sm font-semibold text-[var(--success)]">{profileFeedback}</p> : null}

              <button
                type="submit"
                disabled={profilePending}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--primary-contrast)] shadow-glow transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                <Save size={16} />
                {profilePending ? "Saving..." : "Save profile"}
              </button>
            </form>
          </section>

          <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
            <div className="mb-4 flex items-center gap-2 text-[var(--foreground)]">
              <KeyRound size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Security</h2>
            </div>
            <form onSubmit={submitPassword} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Current password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="Enter current password"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="At least 8 characters"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="Repeat new password"
                />
              </label>

              {passwordError ? <p className="text-sm font-semibold text-[var(--status-error)]">{passwordError}</p> : null}
              {passwordFeedback ? <p className="text-sm font-semibold text-[var(--success)]">{passwordFeedback}</p> : null}

              <button
                type="submit"
                disabled={passwordPending || !currentPassword || !newPassword || !confirmPassword}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--primary-contrast)] shadow-glow transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                <ShieldCheck size={16} />
                {passwordPending ? "Updating..." : "Change password"}
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Order insights</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-soft)]">Total orders</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{orderSummary.totalOrders}</p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-soft)]">Open orders</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{orderSummary.activeOrders}</p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-soft)]">Paid/Shipped</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{orderSummary.paidOrders}</p>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-soft)]">Cancelled</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{orderSummary.cancelledOrders}</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-primary/20 bg-primary/10 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">Total spend</p>
              <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">{currency.format(orderSummary.totalSpent)}</p>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Saved lists</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
                <span className="inline-flex items-center gap-2 text-secondary"><Heart size={14} /> Wishlist</span>
                <strong className="text-[var(--foreground)]">{listSummary.wishlist}</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
                <span className="inline-flex items-center gap-2 text-secondary"><Scale size={14} /> Compare</span>
                <strong className="text-[var(--foreground)]">{listSummary.compare}</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
                <span className="inline-flex items-center gap-2 text-secondary"><ShoppingBag size={14} /> Cart</span>
                <strong className="text-[var(--foreground)]">{listSummary.cart}</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
                <span className="inline-flex items-center gap-2 text-secondary"><Clock3 size={14} /> Recently viewed</span>
                <strong className="text-[var(--foreground)]">{listSummary.recent}</strong>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
                <span className="inline-flex items-center gap-2 text-secondary"><BellRing size={14} /> Save for later</span>
                <strong className="text-[var(--foreground)]">{listSummary.savedForLater}</strong>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Last shipping details</h2>
            {latestShipping ? (
              <div className="mt-4 space-y-2 text-sm text-secondary">
                <p className="font-semibold text-[var(--foreground)]">{latestShipping.fullName}</p>
                <p>{latestShipping.address}</p>
                <p>
                  {latestShipping.city}, {latestShipping.state}
                </p>
                <p className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                  <Package size={12} />
                  {latestShipping.shippingType === "LOCAL_PICKUP" ? "Local pickup" : "Delivery"}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-secondary">No shipping details saved yet. Your first checkout will populate this section.</p>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Recent orders</h2>
              <Link href="/account/orders" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:text-[var(--primary-hover)]">
                View all
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-secondary">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">#{order.id.slice(-8).toUpperCase()}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusTone(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{currency.format(order.totalAmount)}</p>
                    <p className="mt-1 text-xs text-secondary">{order.itemCount} item(s) • {new Date(order.createdAtIso).toLocaleDateString("en-NG")}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
