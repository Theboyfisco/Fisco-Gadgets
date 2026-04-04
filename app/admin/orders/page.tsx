import Link from "next/link";
import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { OrderAdminConsole } from "@/components/admin/OrderAdminConsole";
import { AdminSectionNav } from "@/components/admin/AdminSectionNav";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { requireAdmin } from "@/lib/admin-auth";

type AdminOrdersSearchParams = {
  q?: string;
  status?: string;
  page?: string;
};

const PAGE_SIZE = 12;
const ORDER_STATUSES = Object.values(OrderStatus);
const ADMIN_DATE_FORMATTER = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

function parsePage(value?: string) {
  const parsed = Number(value || "1");
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function buildOrderSearchWhere(query: string): Prisma.OrderWhereInput {
  if (!query) return {};
  return {
    OR: [
      { id: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
      { promoCode: { contains: query, mode: "insensitive" } },
      { paymentReference: { contains: query, mode: "insensitive" } },
      {
        customer: {
          is: {
            fullName: { contains: query, mode: "insensitive" },
          },
        },
      },
      {
        shippingDetails: {
          is: {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { address: { contains: query, mode: "insensitive" } },
              { city: { contains: query, mode: "insensitive" } },
              { state: { contains: query, mode: "insensitive" } },
            ],
          },
        },
      },
      {
        items: {
          some: {
            product: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        },
      },
    ],
  };
}

function buildOrdersPageHref(page: number, query: string, statusFilter: "ALL" | OrderStatus) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (statusFilter !== "ALL") params.set("status", statusFilter);
  params.set("page", String(page));
  return `/admin/orders?${params.toString()}`;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<AdminOrdersSearchParams>;
}) {
  await requireAdmin();
  const databaseEnabled = shouldUseDatabase();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!databaseEnabled) {
    return (
      <div className="container mx-auto flex-1 px-4 py-10">
        <AdminSectionNav activePath="/admin/orders" />

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

  const query = (resolvedSearchParams?.q || "").trim();
  const requestedStatus = (resolvedSearchParams?.status || "ALL").toUpperCase();
  const statusFilter = ORDER_STATUSES.includes(requestedStatus as OrderStatus)
    ? (requestedStatus as OrderStatus)
    : "ALL";
  const requestedPage = parsePage(resolvedSearchParams?.page);

  const baseWhere = buildOrderSearchWhere(query);
  const filteredWhere: Prisma.OrderWhereInput = {
    ...baseWhere,
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
  };

  const [totalFiltered, statusRows, paidRevenue] = await Promise.all([
    prisma.order.count({ where: filteredWhere }),
    prisma.order.groupBy({
      by: ["status"],
      where: filteredWhere,
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: {
        AND: [filteredWhere, { status: { in: [OrderStatus.PAID, OrderStatus.SHIPPED] } }],
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const orders = await prisma.order.findMany({
    where: filteredWhere,
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
      shippingDetails: true,
      customer: {
        select: {
          fullName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: PAGE_SIZE,
  });

  const countsByStatus = Object.fromEntries(
    statusRows.map((row) => [row.status, row._count._all]),
  ) as Record<OrderStatus, number>;

  const hasActiveFilter = query.length > 0 || statusFilter !== "ALL";
  const pageLinks = Array.from(
    new Set([1, safePage - 1, safePage, safePage + 1, totalPages].filter((value) => value >= 1 && value <= totalPages)),
  ).sort((left, right) => left - right);

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <AdminSectionNav activePath="/admin/orders" />

      <Reveal className="mb-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] sm:p-8 lg:p-10">
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-[var(--hero-foreground)] sm:text-5xl">
            Track payments, fulfillment, and delivery status.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--hero-foreground-soft)] sm:text-base">
            Filter orders server-side by customer, product, status, and payment reference.
          </p>
          <form method="get" className="mt-6 grid gap-3 rounded-[1.2rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by order, customer, email, phone, item, payment ref..."
              className="interactive-focus w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
            />
            <select
              name="status"
              defaultValue={statusFilter}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            >
              <option value="ALL">All statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <input type="hidden" name="page" value="1" />
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-contrast)]"
            >
              Apply filters
            </button>
            {hasActiveFilter ? (
              <Link
                href="/admin/orders"
                className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground)] md:col-start-4"
              >
                Clear filters
              </Link>
            ) : null}
          </form>
        </section>
      </Reveal>

      <OrderAdminConsole
        orders={orders.map((order) => ({
          id: order.id,
          email: order.email,
          phone: order.phone,
          status: order.status,
          totalAmount: order.totalAmount,
          discountAmount: order.discountAmount,
          promoCode: order.promoCode ?? undefined,
          paymentReference: order.paymentReference ?? undefined,
          customerName: order.customer?.fullName ?? order.shippingDetails?.fullName ?? undefined,
          createdAt: order.createdAt.toISOString(),
          createdAtLabel: ADMIN_DATE_FORMATTER.format(order.createdAt),
          reservedUntil: order.reservedUntil?.toISOString(),
          reservedUntilLabel: order.reservedUntil ? ADMIN_DATE_FORMATTER.format(order.reservedUntil) : undefined,
          itemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
          })),
          shippingFullName: order.shippingDetails?.fullName ?? undefined,
          shippingAddress: order.shippingDetails?.address ?? undefined,
          shippingType: order.shippingDetails?.shippingType ?? undefined,
          shippingFee: order.shippingDetails?.shippingFee ?? undefined,
          shippingCity: order.shippingDetails?.city ?? undefined,
          shippingState: order.shippingDetails?.state ?? undefined,
        }))}
        summary={{
          total: totalFiltered,
          pending: countsByStatus.PENDING ?? 0,
          paid: countsByStatus.PAID ?? 0,
          shipped: countsByStatus.SHIPPED ?? 0,
          cancelled: countsByStatus.CANCELLED ?? 0,
          revenue: paidRevenue._sum.totalAmount ?? 0,
        }}
        resultsLabel={`Showing ${orders.length === 0 ? 0 : skip + 1}-${skip + orders.length} of ${totalFiltered} matching orders`}
      />

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildOrdersPageHref(Math.max(1, safePage - 1), query, statusFilter)}
              aria-disabled={safePage <= 1}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                safePage <= 1
                  ? "pointer-events-none border-[var(--border-subtle)] text-[var(--text-soft)]"
                  : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
              }`}
            >
              Previous
            </Link>
            {pageLinks.map((pageLink) => (
              <Link
                key={pageLink}
                href={buildOrdersPageHref(pageLink, query, statusFilter)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                  pageLink === safePage
                    ? "border-primary bg-primary text-[var(--primary-contrast)]"
                    : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                }`}
              >
                {pageLink}
              </Link>
            ))}
            <Link
              href={buildOrdersPageHref(Math.min(totalPages, safePage + 1), query, statusFilter)}
              aria-disabled={safePage >= totalPages}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                safePage >= totalPages
                  ? "pointer-events-none border-[var(--border-subtle)] text-[var(--text-soft)]"
                  : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
