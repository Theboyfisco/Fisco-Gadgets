"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-client";

export function SuccessEventTracker({ orderId, status }: { orderId: string; status: "PENDING" | "PAID" | "SHIPPED" | "CANCELLED" }) {
  useEffect(() => {
    trackEvent({
      name: "payment_status_page_view",
      payload: { orderId, status },
    });
  }, [orderId, status]);

  return null;
}
