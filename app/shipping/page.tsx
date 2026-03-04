"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex-1 max-w-3xl">
      <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-white mb-8 transition-colors group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>
      <h1 className="text-4xl font-extrabold text-white mb-8">Shipping Policy</h1>
      
      <div className="space-y-8 text-secondary">
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Delivery Times</h2>
          <p className="mb-4">We pride ourselves on lightning-fast delivery across Nigeria. Delivery estimates depend on your location:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong className="text-emerald-400">Asaba & Environs:</strong> Same day delivery for orders placed before 2 PM. Orders placed after 2 PM will arrive the next morning.</li>
            <li><strong className="text-white">Lagos, Abuja, PH:</strong> 1-2 business days.</li>
            <li><strong className="text-white">Other Locations in Nigeria:</strong> 2-4 business days.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Shipping Costs</h2>
          <p>Shipping fees are automatically calculated at checkout based on the delivery distance. Free delivery is available for orders exceeding ₦2,000,000 within Asaba.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Order Tracking</h2>
          <p>Once your order has been dispatched, you will receive an automatic email and SMS containing your tracking number and expected delivery timeframe.</p>
        </section>
      </div>
    </div>
  );
}
