import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Clock, XCircle } from "lucide-react";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ResumePaymentButton } from "@/components/checkout/ResumePaymentButton";
import { PICKUP_DETAILS } from "@/services/shipping";
import { SuccessEventTracker } from "@/components/checkout/SuccessEventTracker";
import { getPrimaryImage } from "@/lib/normalize-product";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ orderId: string }> }) {
    const { orderId } = await searchParams;

    if (!orderId) {
        notFound();
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            shippingDetails: true
        }
    });

    if (!order) {
        notFound();
    }

    const itemsSubtotal = order.items.reduce((sum, item: any) => sum + item.priceAtPurchase * item.quantity, 0);
    const shippingFee = order.shippingDetails?.shippingFee ?? 0;
    const totalPaid = order.totalAmount;
    const discountAmount = order.discountAmount ?? 0;
    const isPaid = order.status === "PAID";
    const isPending = order.status === "PENDING";
    const isPickup = order.shippingDetails?.shippingType === "LOCAL_PICKUP";
    const supportMessage = encodeURIComponent(`Hi, I need help with order #${order.id.slice(-8).toUpperCase()}. Status: ${order.status}.`);

    return (
        <div className="container mx-auto flex flex-col items-center px-4 py-24">
            <SuccessEventTracker orderId={order.id} status={order.status} />
            <div className={`mb-8 flex h-24 w-24 items-center justify-center rounded-full border shadow-[0_18px_50px_rgba(63,107,253,0.18)] animate-in zoom-in duration-700 ${
              isPaid
                ? "border-primary/20 bg-primary/10 text-primary"
                : isPending
                  ? "border-[var(--interactive-border)] bg-[var(--surface-soft)] text-secondary"
                  : "border-[var(--status-error)]/20 bg-[var(--status-error)]/10 text-[var(--status-error)]"
            }`}>
                {isPaid ? <CheckCircle2 size={64} /> : isPending ? <Clock size={64} /> : <XCircle size={64} />}
            </div>

            <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-6xl">
                {isPaid ? "Payment Received!" : isPending ? "Payment Pending" : "Order Cancelled"}
            </h1>
            <p className="text-secondary text-lg mb-12 text-center max-w-2xl">
                {isPaid
                  ? "Your order "
                  : isPending
                    ? "Your order "
                    : "Your order "}
                <span className="rounded bg-[var(--surface-card)] px-2 py-1 font-mono text-[var(--foreground)]">#{order.id.slice(-8).toUpperCase()}</span>
                {isPaid
                  ? " has been confirmed. Our team is already preparing your gadgets for dispatch."
                  : isPending
                    ? " is awaiting payment confirmation. Resume payment to complete checkout."
                    : " was cancelled after the reservation expired. Please create a new order if you still need these items."}
            </p>

            <div className="mb-12 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] shadow-[0_24px_80px_rgba(8,18,38,0.12)]">
                <div className="border-b border-border-subtle bg-[var(--surface-soft)] p-6">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
                        <Package className="text-primary" /> Order Summary
                    </h2>
                </div>
                
                <div className="space-y-4 p-6">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
                                <Image 
                                    src={getPrimaryImage(item.product.images)} 
                                    alt={item.product.name} 
                                    fill 
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-[var(--foreground)]">{item.product.name}</p>
                                <p className="text-sm text-secondary">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-[var(--foreground)]">
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.priceAtPurchase * item.quantity)}
                            </p>
                        </div>
                    ))}
                    
                    <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4 text-sm">
                        <div className="flex justify-between text-secondary">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(itemsSubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-secondary">
                            <span>Shipping Fee</span>
                            <span className={shippingFee === 0 ? "text-primary" : "text-[var(--foreground)]"}>
                              {shippingFee === 0
                                ? "FREE"
                                : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(shippingFee)}
                            </span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-primary">
                            <span>Discount {order.promoCode ? `(${order.promoCode})` : ""}</span>
                            <span>-{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 text-xl font-bold text-[var(--foreground)]">
                            <span>Total</span>
                            <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalPaid)}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[var(--border-subtle)] bg-primary/5 p-6">
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">
                      {isPickup ? "Pickup details" : "Delivery Address"}
                    </h3>
                    <p className="font-medium text-[var(--foreground)]">{order.shippingDetails?.fullName}</p>
                    {isPickup ? (
                      <div className="text-secondary text-sm">
                        <p>{PICKUP_DETAILS.address}</p>
                        <p>Hours: {PICKUP_DETAILS.hours}</p>
                        <p>Contact: {PICKUP_DETAILS.contact}</p>
                        <p className="mt-1">{PICKUP_DETAILS.note}</p>
                      </div>
                    ) : (
                      <p className="text-secondary text-sm">{order.shippingDetails?.address}, {order.shippingDetails?.city}, {order.shippingDetails?.state}</p>
                    )}
                </div>
            </div>

            <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
                {isPending ? (
                  <ResumePaymentButton orderId={order.id} />
                ) : (
                  <Link 
                      href="/" 
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-4 text-center text-base font-bold text-[var(--primary-contrast)] shadow-glow transition-all hover:bg-[var(--primary-hover)] active:scale-95"
                  >
                      <ShoppingBag size={20} />
                      Continue Shopping
                  </Link>
                )}
                <Link 
                    href={`https://wa.me/2348000000000?text=${supportMessage}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] py-4 text-center font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface-cta)] active:scale-95"
                >
                    Support
                    <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}

