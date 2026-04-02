"use client";

import { useCart } from "@/components/cart/CartProvider";
import { CreditCard, User, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

import { createOrder } from "@/actions/order";
import { initializePayment } from "@/actions/paystack";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { calculateShippingFee } from "@/services/shipping";

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const prefersReducedMotion = useReducedMotion();

    // Form State
    const [formData, setFormData] = useState<{
        fullName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        shippingType: "LOCAL_PICKUP" | "DELIVERY";
    }>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "Asaba",
        state: "Delta",
        shippingType: "DELIVERY"
    });

    const itemsTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shippingFee = calculateShippingFee(formData.city, formData.state, formData.shippingType);
    const total = itemsTotal + shippingFee;
    const hasStockIssue = cartItems.some((item) => typeof item.product.stock === "number" && item.quantity > item.product.stock);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmOrder = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Create Order in DB
            const orderResult = await createOrder({
                email: formData.email,
                phone: formData.phone,
                items: cartItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                })),
                shipping: {
                    fullName: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    shippingType: formData.shippingType
                }
            });

            if (!orderResult.success || !orderResult.orderId) {
                throw new Error(orderResult.error || "Failed to create order");
            }

            // 2. Initialize Paystack Payment
            const paymentResult = await initializePayment(orderResult.orderId);

            if (!paymentResult.success || !paymentResult.authorization_url) {
                throw new Error(paymentResult.error || "Failed to initialize payment");
            }

            // 3. Clear Cart and Redirect to Paystack
            clearCart();
            window.location.href = paymentResult.authorization_url;

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setIsLoading(false);
        }
    };

    if (cartItems.length === 0 && step !== 3) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="mb-4 text-3xl font-bold text-[var(--foreground)]">Your cart is empty</h1>
                <p className="text-secondary mb-8">Add some gadgets to your stash before checking out.</p>
                <Link
                  href="/"
                  className="rounded-full bg-primary px-8 py-3 text-base font-bold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)]"
                >
                    Back to Store
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto flex-1 px-4 py-12">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2 text-secondary transition-colors hover:text-[var(--foreground)]">
                <ArrowLeft size={20} />
                <span>Back to Store</span>
            </Link>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="mb-8 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-5 shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
                      <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">Checkout flow</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Secure, clean, and low-friction</h1>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${step >= 1 ? 'bg-primary text-[var(--primary-contrast)]' : 'bg-[var(--surface-cta)] text-secondary'}`}>1</div>
                        <div className="h-px bg-[var(--border-subtle)] flex-1"></div>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${step >= 2 ? 'bg-primary text-[var(--primary-contrast)]' : 'bg-[var(--surface-cta)] text-secondary'}`}>2</div>
                        <div className="h-px bg-[var(--border-subtle)] flex-1"></div>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${step === 3 ? 'bg-primary text-[var(--primary-contrast)]' : 'bg-[var(--surface-cta)] text-secondary'}`}>3</div>
                      </div>
                    </div>

                    {error && (
                        <div className="mb-8 flex items-center gap-3 rounded-[1.25rem] border border-[var(--status-error)]/20 bg-[var(--status-error)]/10 p-4 text-[var(--status-error)]">
                            <span className="font-medium">{error}</span>
                        </div>
                    )}
                    {hasStockIssue && (
                        <div className="mb-8 flex items-center gap-3 rounded-[1.25rem] border border-[var(--status-error)]/20 bg-[var(--status-error)]/10 p-4 text-[var(--status-error)]">
                            <span className="font-medium">Some items exceed available stock. Adjust quantities to continue.</span>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                            transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
                            className="space-y-6 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-[0_18px_50px_rgba(8,18,38,0.08)]"
                        >
                            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
                                <User className="text-primary" /> Delivery Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary">Full Name</label>
                                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" className="w-full rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors placeholder:text-[var(--text-soft)] focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary">Email Address</label>
                                    <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors placeholder:text-[var(--text-soft)] focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary">Phone Number</label>
                                    <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors placeholder:text-[var(--text-soft)] focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25" placeholder="080 0000 0000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary">City (NG)</label>
                                    <input name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors placeholder:text-[var(--text-soft)] focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25" placeholder="Asaba" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Shipping Address</label>
                                <textarea
                                  name="address"
                                  value={formData.address}
                                  onChange={handleInputChange}
                                  className="w-full rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors placeholder:text-[var(--text-soft)] focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                                  rows={3}
                                  placeholder="Street address, Apartment, Estate, etc."
                                  disabled={formData.shippingType === "LOCAL_PICKUP"}
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">State</label>
                                <select name="state" value={formData.state} onChange={handleInputChange} className="w-full appearance-none rounded-xl border border-border-subtle bg-[var(--surface-card)] px-4 py-3 text-[var(--foreground)] transition-colors focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 scrollbar-hide">
                                    <option value="Delta" className="bg-[var(--panel-bg)] text-[var(--foreground)]">Delta</option>
                                    <option value="Lagos" className="bg-[var(--panel-bg)] text-[var(--foreground)]">Lagos</option>
                                    <option value="Abuja" className="bg-[var(--panel-bg)] text-[var(--foreground)]">Abuja</option>
                                    <option value="Anambra" className="bg-[var(--panel-bg)] text-[var(--foreground)]">Anambra</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Shipping Method</label>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                      type="button"
                                      onClick={() => setFormData((prev) => ({ ...prev, shippingType: "DELIVERY" }))}
                                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                                        formData.shippingType === "DELIVERY"
                                          ? "border-primary/40 bg-primary/10 text-primary"
                                          : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-secondary hover:text-[var(--foreground)]"
                                      }`}
                                    >
                                        <p className="text-sm font-semibold">Delivery</p>
                                        <p className="text-xs">Nationwide drop-off</p>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFormData((prev) => ({ ...prev, shippingType: "LOCAL_PICKUP" }))}
                                      className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                                        formData.shippingType === "LOCAL_PICKUP"
                                          ? "border-primary/40 bg-primary/10 text-primary"
                                          : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-secondary hover:text-[var(--foreground)]"
                                      }`}
                                    >
                                        <p className="text-sm font-semibold">Local pickup</p>
                                        <p className="text-xs">Collect in person</p>
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => setStep(2)}
                                disabled={
                                  !formData.fullName ||
                                  !formData.email ||
                                  !formData.phone ||
                                  (formData.shippingType !== "LOCAL_PICKUP" && !formData.address) ||
                                  hasStockIssue
                                }
                                className="mt-8 w-full rounded-full bg-primary py-4 text-base font-bold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Continue to Payment
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                            transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
                            className="space-y-6 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-[0_18px_50px_rgba(8,18,38,0.08)]"
                        >
                            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-[var(--foreground)]">
                                <CreditCard className="text-primary" /> Payment Method
                            </h2>
                            <div className="space-y-4">
                                <div className="flex cursor-pointer items-center justify-between rounded-[1.5rem] border border-primary bg-primary/10 p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-cta)] text-primary">
                                            <ShieldCheck />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--foreground)]">Paystack Secure</p>
                                            <p className="text-xs text-secondary">Cards, Bank Transfer, USSD</p>
                                        </div>
                                    </div>
                                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                                        <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button 
                                    onClick={() => setStep(1)}
                                    disabled={isLoading}
                                    className="flex-1 rounded-full border border-border-subtle py-4 font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-card)] disabled:opacity-50"
                                >
                                    Go Back
                                </button>
                                <button 
                                    onClick={handleConfirmOrder}
                                    disabled={isLoading || hasStockIssue}
                                    className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-primary py-4 text-base font-bold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Processing...
                                        </>
                                    ) : "Initialize Payment"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step-3"
                            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                            transition={{ duration: MOTION.duration.base, ease: MOTION.ease.standard }}
                            className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] py-12 text-center shadow-[0_18px_50px_rgba(8,18,38,0.08)]"
                        >
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <ShieldCheck size={48} />
                            </div>
                            <h2 className="mb-4 text-3xl font-extrabold text-[var(--foreground)]">Order Confirmed!</h2>
                            <p className="text-secondary max-w-md mx-auto mb-8">
                                Thank you for your purchase. We&apos;ve sent a confirmation email to you. Our dispatch team will contact you shortly for delivery.
                            </p>
                            <Link href="/" className="inline-block rounded-full border border-border-subtle bg-[var(--surface-card)] px-8 py-3 font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-cta)]">
                                Return to Home
                            </Link>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 rounded-[1.75rem] border border-border-subtle bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
                        <h3 className="mb-6 border-b border-border-subtle pb-4 text-xl font-bold text-[var(--foreground)]">Order Summary</h3>
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                            {cartItems.map((item) => (
                                <div key={item.product.id} className="flex gap-4">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-card)]">
                                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="line-clamp-1 text-sm font-medium text-[var(--foreground)]">{item.product.name}</p>
                                        <p className="text-secondary text-xs">Qty {item.quantity}</p>
                                        <p className="text-primary text-xs font-bold">
                                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.product.price)}
                                        </p>
                                        <p className="text-xs text-secondary">
                                            Line: {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.product.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 pt-4 border-t border-border-subtle text-sm">
                            <div className="flex justify-between text-secondary">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(itemsTotal)}</span>
                            </div>
                            <div className="flex justify-between text-secondary">
                                <span>Shipping Fees</span>
                                <span className={shippingFee === 0 ? "text-[var(--success)]" : "text-[var(--foreground)]"}>
                                  {shippingFee === 0
                                    ? "FREE"
                                    : new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(shippingFee)}
                                </span>
                            </div>
                            <div className="flex justify-between pt-2 text-lg font-bold text-[var(--foreground)]">
                                <span>Total Payable</span>
                                <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


