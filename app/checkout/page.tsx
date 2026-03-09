"use client";

import { useCart } from "@/components/cart/CartProvider";
import { CreditCard, User, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

import { createOrder } from "@/actions/order";
import { initializePayment } from "@/actions/paystack";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
    const { cartItems, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "Asaba",
        state: "Delta",
        shippingType: "DELIVERY" as const
    });

    const total = cartItems.reduce((acc, item) => acc + item.price, 0);

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
                    productId: item.id,
                    quantity: 1 // Logic for quantity can be expanded later
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
                <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
                <p className="text-secondary mb-8">Add some gadgets to your stash before checking out.</p>
                <Link href="/" className="bg-primary text-base px-8 py-3 rounded-standard font-bold hover:bg-emerald-400 transition-colors">
                    Back to Store
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 flex-1">
            <Link href="/" className="flex items-center gap-2 text-secondary hover:text-white mb-8 transition-colors">
                <ArrowLeft size={20} />
                <span>Back to Store</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-base' : 'bg-white/10 text-secondary'}`}>1</div>
                        <div className="h-px bg-white/10 flex-1"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-base' : 'bg-white/10 text-secondary'}`}>2</div>
                        <div className="h-px bg-white/10 flex-1"></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 3 ? 'bg-primary text-base' : 'bg-white/10 text-secondary'}`}>3</div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-standard mb-8 flex items-center gap-3">
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <User className="text-primary" /> Delivery Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary">Full Name</label>
                                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" className="w-full bg-white/5 border border-border-subtle rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary">Email Address</label>
                                    <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full bg-white/5 border border-border-subtle rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary">Phone Number</label>
                                    <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-white/5 border border-border-subtle rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="080 0000 0000" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-secondary">City (NG)</label>
                                    <input name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full bg-white/5 border border-border-subtle rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="Asaba" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">Shipping Address</label>
                                <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-white/5 border border-border-subtle rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" rows={3} placeholder="Street address, Apartment, Estate, etc."></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-secondary">State</label>
                                <select name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-white/5 border border-border-subtle rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none scrollbar-hide">
                                    <option value="Delta" className="bg-base">Delta</option>
                                    <option value="Lagos" className="bg-base">Lagos</option>
                                    <option value="Abuja" className="bg-base">Abuja</option>
                                    <option value="Anambra" className="bg-base">Anambra</option>
                                </select>
                            </div>
                            <button 
                                onClick={() => setStep(2)}
                                disabled={!formData.fullName || !formData.email || !formData.phone || !formData.address}
                                className="w-full bg-primary text-base py-4 rounded-standard font-bold hover:bg-emerald-400 transition-colors shadow-glow mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to Payment
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <CreditCard className="text-primary" /> Payment Method
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 rounded-standard border border-primary bg-primary/10 flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-primary">
                                            <ShieldCheck />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">Paystack Secure</p>
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
                                    className="flex-1 border border-border-subtle text-white py-4 rounded-standard font-bold hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    Go Back
                                </button>
                                <button 
                                    onClick={handleConfirmOrder}
                                    disabled={isLoading}
                                    className="flex-[2] bg-primary text-base py-4 rounded-standard font-bold hover:bg-emerald-400 transition-colors shadow-glow flex items-center justify-center gap-2 disabled:opacity-70"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Processing...
                                        </>
                                    ) : "Initialize Payment"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-12 animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                                <ShieldCheck size={48} />
                            </div>
                            <h2 className="text-3xl font-extrabold text-white mb-4">Order Confirmed!</h2>
                            <p className="text-secondary max-w-md mx-auto mb-8">
                                Thank you for your purchase. We&apos;ve sent a confirmation email to you. Our dispatch team will contact you shortly for delivery.
                            </p>
                            <Link href="/" className="inline-block bg-white/5 border border-border-subtle text-white px-8 py-3 rounded-standard font-bold hover:bg-white/10 transition-colors">
                                Return to Home
                            </Link>
                        </div>
                    )}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 border border-border-subtle rounded-standard p-6 sticky top-24">
                        <h3 className="text-xl font-bold text-white mb-6 pb-4 border-b border-border-subtle">Order Summary</h3>
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                            {cartItems.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-base shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white line-clamp-1">{item.name}</p>
                                        <p className="text-primary text-xs font-bold">
                                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(item.price)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 pt-4 border-t border-border-subtle text-sm">
                            <div className="flex justify-between text-secondary">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(total)}</span>
                            </div>
                            <div className="flex justify-between text-secondary">
                                <span>Shipping Fees</span>
                                <span className="text-emerald-400">Calculated</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-white pt-2">
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

