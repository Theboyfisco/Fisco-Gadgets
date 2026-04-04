import prisma from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { OrderAdminConsole } from "@/components/admin/OrderAdminConsole";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const databaseEnabled = shouldUseDatabase();

  if (!databaseEnabled) {
    return (
      <div className="container mx-auto flex-1 px-4 py-10">
        <Reveal>
          <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-8 shadow-[0_24px_70px_rgba(var(--shadow-neutral-rgb),0.12)]">
            <h1 className="text-4xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Order management is unavailable during build-only mode.</h1>
            <p className="mt-4 max-w-2xl text-sm text-secondary">
              This page needs a live database connection because it manages paid and pending orders.
            </p>
          </div>
        </Reveal>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    include: { items: true, shippingDetails: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <Reveal className="mb-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] sm:p-8 lg:p-10">
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-[var(--hero-foreground)] sm:text-5xl">
            Track payments, fulfillment, and delivery status.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--hero-foreground-soft)] sm:text-base">
            Review orders, confirm payments, and move shipments forward without leaving the admin console.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/promos"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Promo console
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
        </section>
      </Reveal>

      <OrderAdminConsole
        orders={orders.map((order) => ({
          id: order.id,
          email: order.email,
          phone: order.phone,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt.toISOString(),
          itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          shippingCity: order.shippingDetails?.city ?? undefined,
          shippingState: order.shippingDetails?.state ?? undefined,
        }))}
      />
    </div>
  );
}

