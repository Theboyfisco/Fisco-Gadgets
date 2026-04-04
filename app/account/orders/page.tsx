import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/db";
import { requireCustomer } from "@/lib/customer-auth";
import { Package, Truck, CheckCircle2, Clock3, XCircle, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/support-config";

function statusTone(status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED") {
  if (status === "PAID") return "text-primary border-primary/30 bg-primary/10";
  if (status === "SHIPPED") return "text-[var(--success)] border-[var(--success)]/30 bg-[var(--success)]/10";
  if (status === "CANCELLED") return "text-[var(--status-error)] border-[var(--status-error)]/30 bg-[var(--status-error)]/10";
  return "text-secondary border-[var(--border-subtle)] bg-[var(--surface-soft)]";
}

function trackingSteps(status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED") {
  const isCancelled = status === "CANCELLED";
  return [
    { label: "Order placed", done: true },
    { label: "Payment confirmed", done: status === "PAID" || status === "SHIPPED" },
    { label: "Shipped", done: status === "SHIPPED" },
    { label: isCancelled ? "Order cancelled" : "Delivered", done: false },
  ];
}

export default async function AccountOrdersPage() {
  const customer = await requireCustomer();

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ customerId: customer.id }, { email: customer.email }],
    },
    include: {
      items: {
        include: { product: true },
      },
      shippingDetails: true,
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <div className="mb-8 rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-6 shadow-[0_24px_70px_rgba(var(--shadow-neutral-rgb),0.14)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">My account</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">Order history & tracking</h1>
        <p className="mt-2 text-sm text-secondary">
          Signed in as <span className="font-semibold text-[var(--foreground)]">{customer.email}</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/account/profile"
            className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            Profile
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            Continue shopping
          </Link>
          <Link
            href="/account/logout"
            className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            Sign out
          </Link>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-12 text-center">
          <p className="text-lg text-secondary">No orders yet.</p>
          <Link href="/" className="interactive-focus link-accent mt-2 inline-block text-sm">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const itemsSubtotal = order.items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0);
            const shippingFee = order.shippingDetails?.shippingFee ?? 0;
            const steps = trackingSteps(order.status);
            const supportUrl = buildWhatsAppLink(`Hi, I need support for order #${order.id.slice(-8).toUpperCase()} (${order.status}).`);

            return (
              <article
                key={order.id}
                className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-5 shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Order reference</p>
                    <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">#{order.id.slice(-8).toUpperCase()}</h2>
                    <p className="mt-1 text-sm text-secondary">{new Date(order.createdAt).toLocaleString("en-NG")}</p>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusTone(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)]">
                          <Image src={item.product.images[0] || "/icon.png"} alt={item.product.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-[var(--foreground)]">{item.product.name}</p>
                          <p className="text-xs text-secondary">Qty {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">
                          {new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
                            item.priceAtPurchase * item.quantity,
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  <aside className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Tracking</p>
                    <div className="mt-3 space-y-2">
                      {steps.map((step, index) => (
                        <div key={step.label} className="flex items-center gap-2 text-sm">
                          {order.status === "CANCELLED" && index === 3 ? (
                            <XCircle size={16} className="text-[var(--status-error)]" />
                          ) : step.done ? (
                            <CheckCircle2 size={16} className="text-primary" />
                          ) : index === 2 ? (
                            <Truck size={16} className="text-secondary" />
                          ) : (
                            <Clock3 size={16} className="text-secondary" />
                          )}
                          <span className={step.done ? "text-[var(--foreground)]" : "text-secondary"}>{step.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-[var(--border-subtle)] pt-3 text-sm">
                      <div className="flex justify-between text-secondary">
                        <span>Subtotal</span>
                        <span>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(itemsSubtotal)}</span>
                      </div>
                      <div className="mt-1 flex justify-between text-secondary">
                        <span>Shipping</span>
                        <span>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(shippingFee)}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="mt-1 flex justify-between text-primary">
                          <span>Discount ({order.promoCode || "promo"})</span>
                          <span>-{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(order.discountAmount)}</span>
                        </div>
                      )}
                      <div className="mt-2 flex justify-between text-base font-semibold text-[var(--foreground)]">
                        <span>Total</span>
                        <span>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(order.totalAmount)}</span>
                      </div>
                    </div>
                  </aside>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={supportUrl}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-[var(--foreground)]"
                  >
                    <MessageCircle size={14} />
                    Order support
                  </a>
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    <Package size={14} />
                    {order.shippingDetails?.shippingType === "LOCAL_PICKUP" ? "Local pickup" : "Delivery"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

