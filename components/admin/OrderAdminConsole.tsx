"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/actions/admin-order";
import type { OrderStatus, ShippingType } from "@prisma/client";
import { useToast } from "@/components/ui/ToastProvider";

type AdminOrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
};

type AdminOrder = {
  id: string;
  email: string;
  phone: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  promoCode?: string;
  paymentReference?: string;
  customerName?: string;
  createdAt: string;
  createdAtLabel: string;
  reservedUntil?: string;
  reservedUntilLabel?: string;
  itemsCount: number;
  items: AdminOrderItem[];
  shippingFullName?: string;
  shippingAddress?: string;
  shippingType?: ShippingType;
  shippingFee?: number;
  shippingCity?: string;
  shippingState?: string;
};

type OrderSummary = {
  total: number;
  pending: number;
  paid: number;
  shipped: number;
  cancelled: number;
  revenue: number;
};

const STATUS_ORDER: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "CANCELLED"];
const CURRENCY_FORMATTER = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

function formatCurrency(value: number) {
  return CURRENCY_FORMATTER.format(value);
}

function getStatusBadge(status: OrderStatus) {
  if (status === "PAID") return "border-[var(--status-success)]/30 bg-[var(--status-success)]/10 text-[var(--status-success)]";
  if (status === "SHIPPED") return "border-primary/30 bg-primary/10 text-primary";
  if (status === "CANCELLED") return "border-[var(--status-error)]/30 bg-[var(--status-error)]/10 text-[var(--status-error)]";
  return "border-[var(--status-warning)]/30 bg-[var(--status-warning)]/10 text-[var(--status-warning)]";
}

function getOrderTimeline(order: AdminOrder) {
  const paymentConfirmed = order.status === "PAID" || order.status === "SHIPPED";
  const shipped = order.status === "SHIPPED";
  const cancelled = order.status === "CANCELLED";

  const steps = [
    {
      id: "placed",
      title: "Order placed",
      done: true,
      note: order.createdAtLabel,
    },
    {
      id: "payment",
      title: "Payment confirmed",
      done: paymentConfirmed,
      note: paymentConfirmed ? "Payment accepted" : "Awaiting payment confirmation",
    },
    {
      id: "shipped",
      title: "Order shipped",
      done: shipped,
      note: shipped ? "Shipment dispatched" : "Awaiting fulfillment",
    },
    {
      id: "cancelled",
      title: "Order cancelled",
      done: cancelled,
      note: cancelled ? "Cancelled by admin workflow" : "Order remains active",
    },
  ];

  if (order.reservedUntilLabel) {
    steps.push({
      id: "reservation",
      title: "Reservation window",
      done: order.status !== "PENDING",
      note: `Expires ${order.reservedUntilLabel}`,
    });
  }

  return steps;
}

export function OrderAdminConsole({
  orders,
  summary,
  resultsLabel,
}: {
  orders: AdminOrder[];
  summary: OrderSummary;
  resultsLabel: string;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [draftStatuses, setDraftStatuses] = useState<Record<string, OrderStatus>>(
    Object.fromEntries(orders.map((order) => [order.id, order.status])),
  );

  const handleSave = (orderId: string) => {
    const currentOrder = orders.find((order) => order.id === orderId);
    const nextStatus = draftStatuses[orderId] ?? currentOrder?.status;
    if (!nextStatus) return;

    setPendingOrderId(orderId);
    startTransition(async () => {
      try {
        const result = await updateOrderStatus(orderId, nextStatus);
        if (!result.success) {
          pushToast({
            title: "Update failed",
            description: result.error || "Unable to update order",
            variant: "warning",
          });
          return;
        }

        pushToast({
          title: "Order updated",
          description: `Status set to ${nextStatus}`,
          variant: "success",
        });
        router.refresh();
      } catch {
        pushToast({
          title: "Update failed",
          description: "Unable to update order right now.",
          variant: "warning",
        });
      } finally {
        setPendingOrderId(null);
      }
    });
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((previous) => ({ ...previous, [orderId]: !previous[orderId] }));
  };

  return (
    <section className="space-y-4">
      <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_16px_45px_rgba(var(--shadow-neutral-rgb),0.08)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Total</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{summary.total}</p>
          </div>
          <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Pending</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{summary.pending}</p>
          </div>
          <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Paid</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{summary.paid}</p>
          </div>
          <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Shipped</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{summary.shipped}</p>
          </div>
          <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Cancelled</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{summary.cancelled}</p>
          </div>
          <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Revenue</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{formatCurrency(summary.revenue)}</p>
          </div>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">{resultsLabel}</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-secondary">
          No orders match the current filters.
        </div>
      ) : (
        orders.map((order) => {
          const isExpanded = Boolean(expandedOrders[order.id]);
          const orderSubtotal = order.items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
          const currentStatus = draftStatuses[order.id] ?? order.status;
          const isSaving = pendingOrderId === order.id || isPending;
          return (
            <article
              key={order.id}
              className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]"
            >
              <button
                type="button"
                onClick={() => toggleOrderDetails(order.id)}
                className="w-full rounded-[1rem] text-left transition-colors hover:bg-[var(--surface-soft)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 p-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Order</p>
                      <span
                        className={[
                          "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                          getStatusBadge(order.status),
                        ].join(" ")}
                      >
                        {order.status}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">#{order.id.slice(-8).toUpperCase()}</h3>
                    <p className="mt-1 text-xs text-secondary">{order.createdAtLabel}</p>
                    <p className="mt-2 text-sm text-secondary">
                      {order.customerName || "Customer not set"} • {order.email} • {order.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Total</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{formatCurrency(order.totalAmount)}</p>
                    {order.discountAmount > 0 ? (
                      <p className="mt-1 text-xs text-secondary">Discount: {formatCurrency(order.discountAmount)}</p>
                    ) : null}
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {isExpanded ? "Tap to collapse" : "Tap to view full details"}
                    </p>
                  </div>
                </div>
              </button>

              <div className="mt-4 grid gap-3 text-xs text-secondary sm:grid-cols-4">
                <div>
                  <p className="uppercase tracking-[0.18em] text-[var(--text-soft)]">Items</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{order.itemsCount}</p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.18em] text-[var(--text-soft)]">Location</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                    {order.shippingCity || "—"}, {order.shippingState || "—"}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.18em] text-[var(--text-soft)]">Payment ref</p>
                  <p className="mt-1 truncate text-sm font-semibold text-[var(--foreground)]">
                    {order.paymentReference || "Not generated yet"}
                  </p>
                </div>
                <div>
                  <p className="uppercase tracking-[0.18em] text-[var(--text-soft)]">Promo</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{order.promoCode || "None"}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <select
                  value={currentStatus}
                  onChange={(event) =>
                    setDraftStatuses((previous) => ({ ...previous, [order.id]: event.target.value as OrderStatus }))
                  }
                  disabled={order.status === "CANCELLED"}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleSave(order.id)}
                  disabled={isSaving || order.status === "CANCELLED" || currentStatus === order.status}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-contrast)] disabled:opacity-60"
                >
                  {order.status === "CANCELLED" ? "Cancelled" : isSaving ? "Saving..." : "Save status"}
                </button>
                <span className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)]">
                  {isExpanded ? "Expanded" : "Tap card to expand"}
                </span>
              </div>

              {isExpanded ? (
                <div className="mt-4 rounded-[1.2rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
                  <div className="mb-3 rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Order timeline</p>
                    <div className="mt-3 space-y-2">
                      {getOrderTimeline(order).map((step) => (
                        <div key={step.id} className="flex items-start gap-3">
                          <span
                            className={[
                              "mt-0.5 inline-flex h-4 w-4 shrink-0 rounded-full border",
                              step.done
                                ? "border-primary bg-primary/25"
                                : "border-[var(--border-subtle)] bg-[var(--surface-soft)]",
                            ].join(" ")}
                          />
                          <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">{step.title}</p>
                            <p className="text-xs text-secondary">{step.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Customer details</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{order.shippingFullName || order.customerName || "—"}</p>
                      <p className="mt-1 text-xs text-secondary">{order.email}</p>
                      <p className="mt-1 text-xs text-secondary">{order.phone}</p>
                    </div>
                    <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Shipping details</p>
                      <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{order.shippingType || "—"}</p>
                      <p className="mt-1 text-xs text-secondary">{order.shippingAddress || "Address unavailable"}</p>
                      <p className="mt-1 text-xs text-secondary">
                        {order.shippingCity || "—"}, {order.shippingState || "—"}
                      </p>
                      <p className="mt-1 text-xs text-secondary">
                        Shipping fee: {order.shippingFee !== undefined ? formatCurrency(order.shippingFee) : "—"}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Payment details</p>
                      <p className="mt-2 text-xs text-secondary">Subtotal: {formatCurrency(orderSubtotal)}</p>
                      <p className="mt-1 text-xs text-secondary">Discount: {formatCurrency(order.discountAmount)}</p>
                      <p className="mt-1 text-xs text-secondary">Total: {formatCurrency(order.totalAmount)}</p>
                      <p className="mt-1 text-xs text-secondary">Promo code: {order.promoCode || "None"}</p>
                      <p className="mt-1 text-xs text-secondary">Reference: {order.paymentReference || "Not generated yet"}</p>
                      <p className="mt-1 text-xs text-secondary">Reservation expiry: {order.reservedUntilLabel || "—"}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-[1rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Order items</p>
                    <div className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--border-subtle)] pb-2 last:border-b-0 last:pb-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[var(--foreground)]">{item.productName}</p>
                            <p className="text-xs text-secondary">Product ID: {item.productId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-secondary">
                              {item.quantity} x {formatCurrency(item.priceAtPurchase)}
                            </p>
                            <p className="text-sm font-semibold text-[var(--foreground)]">
                              {formatCurrency(item.quantity * item.priceAtPurchase)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })
      )}
    </section>
  );
}
