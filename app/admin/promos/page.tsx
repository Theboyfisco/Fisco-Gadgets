import Link from "next/link";
import prisma from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { requireAdmin } from "@/lib/admin-auth";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { PromoAdminConsole } from "@/components/admin/PromoAdminConsole";

export default async function AdminPromosPage() {
  await requireAdmin();

  if (!shouldUseDatabase()) {
    return (
      <div className="container mx-auto flex-1 px-4 py-10">
        <Reveal>
          <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-8 shadow-[0_24px_70px_rgba(var(--shadow-neutral-rgb),0.12)]">
            <h1 className="text-4xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Promo management is unavailable in build-only mode.</h1>
            <p className="mt-4 max-w-2xl text-sm text-secondary">Set a live `DATABASE_URL` to manage dynamic promo rules.</p>
          </div>
        </Reveal>
      </div>
    );
  }

  const [promos, orderCounts] = await Promise.all([
    prisma.promoCode.findMany({
      orderBy: [{ updatedAt: "desc" }, { code: "asc" }],
    }),
    prisma.order.groupBy({
      by: ["promoCode"],
      where: { promoCode: { not: null } },
      _count: { promoCode: true },
    }),
  ]);

  const orderCountByCode = new Map(
    orderCounts
      .filter((entry) => entry.promoCode)
      .map((entry) => [String(entry.promoCode), entry._count.promoCode]),
  );

  const activeCount = promos.filter((promo) => promo.active).length;

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <Reveal className="mb-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] sm:p-8 lg:p-10">
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-[var(--hero-foreground)] sm:text-5xl">Run promo campaigns with full control and auditability.</h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--hero-foreground-soft)] sm:text-base">
            Create and update discount rules, control validity windows, and monitor usage all in one admin console.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Order console
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Product console
            </Link>
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Audit log
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Total promos</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{promos.length}</p>
            </div>
            <div className="rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Active promos</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{activeCount}</p>
            </div>
            <div className="rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Orders with promo</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                {orderCounts.reduce((sum, item) => sum + item._count.promoCode, 0)}
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      <PromoAdminConsole
        promos={promos.map((promo) => ({
          id: promo.id,
          code: promo.code,
          description: promo.description,
          kind: promo.kind,
          amount: promo.amount,
          minOrder: promo.minOrder,
          active: promo.active,
          startsAt: promo.startsAt?.toISOString() ?? null,
          endsAt: promo.endsAt?.toISOString() ?? null,
          maxUses: promo.maxUses,
          usedCount: promo.usedCount,
          orderCount: orderCountByCode.get(promo.code) ?? 0,
          updatedAt: promo.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}

