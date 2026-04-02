"use client";

import { useState } from "react";
import { initializePayment } from "@/actions/paystack";

export function ResumePaymentButton({ orderId, className }: { orderId: string; className?: string }) {
  const [loading, setLoading] = useState(false);

  const handleResume = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await initializePayment(orderId);
      if (!result.success || !result.authorization_url) {
        setLoading(false);
        return;
      }
      window.location.href = result.authorization_url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleResume}
      disabled={loading}
      className={
        className ||
        "flex flex-1 items-center justify-center rounded-full bg-primary py-4 text-center text-base font-bold text-[var(--primary-contrast)] shadow-glow transition-all hover:bg-[var(--primary-hover)] active:scale-95 disabled:opacity-70"
      }
    >
      {loading ? "Resuming..." : "Resume Payment"}
    </button>
  );
}
