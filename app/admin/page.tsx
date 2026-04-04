import Link from "next/link";
import { OrderStatus } from "@prisma/client";
import prisma from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { requireAdmin } from "@/lib/admin-auth";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { AdminSectionNav } from "@/components/admin/AdminSectionNav";

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

export default async function AdminOverviewPage() {
  await requireAdmin();

  if (!shouldUseDatabase()) {
    return (
      <div className="container mx-auto flex-1 px-4 py-10">
        <AdminSectionNav activePath="/admin" />
        <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-8 shadow-[0_24px_70px_rgba(var(--shadow-neutral-rgb),0.12)]">
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Admin overview is unavailable in build-only mode.</h1>
          <p className="mt-4 max-w-2xl text-sm text-secondary">Set a live `DATABASE_URL` to access live admin metrics and activity.</p>
        </div>
      </div>
    );
  }

  const [productCount, categoryCount, brandCount, orderCount, customerCount, promoCount, lowStockCount, orderStatusRows, paidRevenue, recentOrders, recentAuditLogs] =
    await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.order.count(),
      prisma.customer.count(),
      prisma.promoCode.count(),
      prisma.product.count({ where: { stock: { lte: 3 } } }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          shippingDetails: true,
          items: { select: { quantity: true } },
        },
      }),
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
    ]);

  const orderStatusCounts = Object.fromEntries(
    orderStatusRows.map((row) => [row.status, row._count._all]),
  ) as Record<OrderStatus, number>;

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <AdminSectionNav activePath="/admin" />

      <Reveal className="mb-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] sm:p-8 lg:p-10">
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-[var(--hero-foreground)] sm:text-5xl">
            Operational overview for catalog, orders, and admin activity.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--hero-foreground-soft)] sm:text-base">
            Monitor business health at a glance, then jump into products, orders, promos, and audit logs.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Manage orders
            </Link>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Manage products
            </Link>
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              View audit logs
            </Link>
          </div>
        </section>
      </Reveal>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_14px_35px_rgba(var(--shadow-neutral-rgb),0.08)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Paid revenue</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{CURRENCY_FORMATTER.format(paidRevenue._sum.totalAmount ?? 0)}</p>
          <p className="mt-1 text-xs text-secondary">From paid and shipped orders</p>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_14px_35px_rgba(var(--shadow-neutral-rgb),0.08)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{orderCount}</p>
          <p className="mt-1 text-xs text-secondary">
            Pending {orderStatusCounts.PENDING ?? 0} • Paid {orderStatusCounts.PAID ?? 0}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_14px_35px_rgba(var(--shadow-neutral-rgb),0.08)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Catalog health</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{productCount} products</p>
          <p className="mt-1 text-xs text-secondary">
            {categoryCount} categories • {brandCount} brands • {lowStockCount} low-stock items
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_14px_35px_rgba(var(--shadow-neutral-rgb),0.08)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Audience and offers</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{customerCount} customers</p>
          <p className="mt-1 text-xs text-secondary">{promoCount} promo codes configured</p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_16px_45px_rgba(var(--shadow-neutral-rgb),0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:text-[var(--primary-hover)]">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-secondary">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--foreground)]">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{order.status}</p>
                  </div>
                  <p className="mt-1 text-xs text-secondary">
                    {order.email} • {(order.shippingDetails?.city || "—")}, {(order.shippingDetails?.state || "—")}
                  </p>
                  <p className="mt-1 text-xs text-secondary">
                    {(order.items.reduce((sum, item) => sum + item.quantity, 0))} items • {CURRENCY_FORMATTER.format(order.totalAmount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_16px_45px_rgba(var(--shadow-neutral-rgb),0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent audit activity</h2>
            <Link href="/admin/audit" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary hover:text-[var(--primary-hover)]">
              Open audit log
            </Link>
          </div>
          {recentAuditLogs.length === 0 ? (
            <p className="text-sm text-secondary">No audit entries yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">{log.entityType}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{log.action}</p>
                  <p className="mt-1 text-xs text-secondary">
                    {log.actor} {log.entityId ? `• ${log.entityId}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-secondary">{new Date(log.createdAt).toLocaleString("en-NG")}</p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
