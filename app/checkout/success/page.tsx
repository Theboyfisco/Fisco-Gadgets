import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from "lucide-react";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";

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

    return (
        <div className="container mx-auto px-4 py-24 flex flex-col items-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-8 animate-in zoom-in duration-700">
                <CheckCircle2 size={64} />
            </div>

            <h1 className="mb-4 text-center text-4xl font-extrabold tracking-tight text-[var(--foreground)] md:text-6xl">
                Payment Received!
            </h1>
            <p className="text-secondary text-lg mb-12 text-center max-w-2xl">
                Your order <span className="rounded bg-[var(--surface-card)] px-2 py-1 font-mono text-[var(--foreground)]">#{order.id.slice(-8).toUpperCase()}</span> has been confirmed. 
                Our team is already preparing your gadgets for dispatch.
            </p>

            <div className="mb-12 w-full max-w-2xl overflow-hidden rounded-3xl border border-border-subtle bg-[var(--surface-card)]">
                <div className="border-b border-border-subtle bg-[var(--surface-soft)] p-6">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-[var(--foreground)]">
                        <Package className="text-primary" /> Order Summary
                    </h2>
                </div>
                
                <div className="p-6 space-y-4">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4 items-center">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
                                <Image 
                                    src={item.product.images[0]} 
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
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.priceAtPurchase)}
                            </p>
                        </div>
                    ))}
                    
                    <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4 text-sm">
                        <div className="flex justify-between text-secondary">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-secondary">
                            <span>Shipping Fee</span>
                            <span className="text-primary">FREE</span>
                        </div>
                        <div className="flex justify-between pt-2 text-xl font-bold text-[var(--foreground)]">
                            <span>Total Paid</span>
                            <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-[var(--border-subtle)] bg-primary/5 p-6">
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Delivery Address</h3>
                    <p className="font-medium text-[var(--foreground)]">{order.shippingDetails?.fullName}</p>
                    <p className="text-secondary text-sm">{order.shippingDetails?.address}, {order.shippingDetails?.city}, {order.shippingDetails?.state}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link 
                    href="/" 
                    className="flex-1 bg-primary text-black text-base py-4 rounded-standard font-bold hover:bg-emerald-400 transition-all text-center flex items-center justify-center gap-2 shadow-glow active:scale-95"
                >
                    <ShoppingBag size={20} />
                    Continue Shopping
                </Link>
                <Link 
                    href="/contact" 
                    className="flex-1 rounded-standard border border-[var(--border-subtle)] bg-[var(--surface-card)] py-4 font-bold text-[var(--foreground)] transition-all hover:bg-[var(--surface-cta)] text-center flex items-center justify-center gap-2 active:scale-95"
                >
                    Support
                    <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}
