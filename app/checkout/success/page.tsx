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

            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-4 text-center">
                Payment Received!
            </h1>
            <p className="text-secondary text-lg mb-12 text-center max-w-2xl">
                Your order <span className="text-white font-mono bg-white/5 px-2 py-1 rounded">#{order.id.slice(-8).toUpperCase()}</span> has been confirmed. 
                Our team is already preparing your gadgets for dispatch.
            </p>

            <div className="w-full max-w-2xl bg-white/5 border border-border-subtle rounded-3xl overflow-hidden mb-12">
                <div className="p-6 border-b border-border-subtle bg-white/[0.02]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Package className="text-primary" /> Order Summary
                    </h2>
                </div>
                
                <div className="p-6 space-y-4">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4 items-center">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-base shrink-0 border border-white/5">
                                <Image 
                                    src={item.product.images[0]} 
                                    alt={item.product.name} 
                                    fill 
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-white font-medium">{item.product.name}</p>
                                <p className="text-sm text-secondary">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-white font-semibold">
                                {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.priceAtPurchase)}
                            </p>
                        </div>
                    ))}
                    
                    <div className="pt-4 border-t border-white/10 space-y-2 text-sm">
                        <div className="flex justify-between text-secondary">
                            <span>Subtotal</span>
                            <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(order.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-secondary">
                            <span>Shipping Fee</span>
                            <span className="text-emerald-400">FREE</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-white pt-2">
                            <span>Total Paid</span>
                            <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-primary/5 border-t border-white/5">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Delivery Address</h3>
                    <p className="text-white font-medium">{order.shippingDetails?.fullName}</p>
                    <p className="text-secondary text-sm">{order.shippingDetails?.address}, {order.shippingDetails?.city}, {order.shippingDetails?.state}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Link 
                    href="/" 
                    className="flex-1 bg-primary text-base py-4 rounded-standard font-bold hover:bg-emerald-400 transition-all text-center flex items-center justify-center gap-2 shadow-glow active:scale-95"
                >
                    <ShoppingBag size={20} />
                    Continue Shopping
                </Link>
                <Link 
                    href="/contact" 
                    className="flex-1 bg-white/5 border border-white/10 text-white py-4 rounded-standard font-bold hover:bg-white/10 transition-all text-center flex items-center justify-center gap-2 active:scale-95"
                >
                    Support
                    <ArrowRight size={20} />
                </Link>
            </div>
        </div>
    );
}
