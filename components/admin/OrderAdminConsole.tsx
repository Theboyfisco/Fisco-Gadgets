"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/actions/admin-order";
import type { OrderStatus } from "@prisma/client";
import { useToast } from "@/components/ui/ToastProvider";

type AdminOrder = {
  id: string;
  email: string;
  phone: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  itemsCount: number;
  shippingCity?: string;
  shippingState?: string;
};

export function OrderAdminConsole({ orders }: { orders: AdminOrder[] }) {
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [draftStatuses, setDraftStatuses] = useState<Record<string, OrderStatus>>(
    Object.fromEntries(orders.map((order) => [order.id, order.status])),
  );

  const handleSave = (orderId: string) => {
    const nextStatus = draftStatuses[orderId];
    startTransition(async () => {
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
    });
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-8 text-center text-sm text-secondary">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Order</p>
              <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">#{order.id.slice(-8).toUpperCase()}</h3>
              <p className="mt-1 text-xs text-secondary">{order.email} • {order.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Total</p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(order.totalAmount)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-xs text-secondary sm:grid-cols-3">
            <div>
              <p className="uppercase tracking-[0.18em] text-[var(--text-soft)]">Items</p>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{order.itemsCount}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.18em] text-[var(--text-soft)]">Created</p>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{new Date(order.createdAt).toLocaleString("en-NG")}</p>
            </div>
            <div>
              <p className="uppercase tracking-[0.18em] text-[var(--text-soft)]">Location</p>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">
                {order.shippingCity || "—"}, {order.shippingState || "—"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select
              value={draftStatuses[order.id]}
              onChange={(event) =>
                setDraftStatuses((prev) => ({ ...prev, [order.id]: event.target.value as OrderStatus }))
              }
              disabled={order.status === "CANCELLED"}
              className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
            >
              <option value="PENDING" className="bg-[var(--panel-bg)] text-[var(--foreground)]">PENDING</option>
              <option value="PAID" className="bg-[var(--panel-bg)] text-[var(--foreground)]">PAID</option>
              <option value="SHIPPED" className="bg-[var(--panel-bg)] text-[var(--foreground)]">SHIPPED</option>
              <option value="CANCELLED" className="bg-[var(--panel-bg)] text-[var(--foreground)]">CANCELLED</option>
            </select>
            <button
              type="button"
              onClick={() => handleSave(order.id)}
              disabled={isPending || order.status === "CANCELLED" || draftStatuses[order.id] === order.status}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary-contrast)] disabled:opacity-60"
            >
              {order.status === "CANCELLED" ? "Cancelled" : isPending ? "Saving..." : "Save status"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

