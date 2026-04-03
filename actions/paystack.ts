"use server";

import prisma from "@/lib/db";
import { captureOperationalAlert } from "@/lib/monitoring";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_MOCK_AUTH_URL = process.env.PAYSTACK_MOCK_AUTH_URL;

function getCallbackBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return vercelUrl.startsWith("http") ? vercelUrl.replace(/\/+$/, "") : `https://${vercelUrl}`;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return null;
}

export async function initializePayment(orderId: string) {
  if (!PAYSTACK_SECRET_KEY && !PAYSTACK_MOCK_AUTH_URL) {
    await captureOperationalAlert({
      source: "checkout.paystack_initialize",
      severity: "critical",
      message: "Paystack secret key is not configured",
      context: { orderId },
    });
    throw new Error("Paystack secret key is not configured");
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shippingDetails: true }
    });

    if (!order) throw new Error("Order not found");
    if (order.status !== "PENDING") {
      throw new Error("Order is not pending");
    }
    if (order.reservedUntil && order.reservedUntil.getTime() < Date.now()) {
      throw new Error("Order reservation expired");
    }

    if (PAYSTACK_MOCK_AUTH_URL) {
      return {
        success: true,
        authorization_url: `${PAYSTACK_MOCK_AUTH_URL}${PAYSTACK_MOCK_AUTH_URL.includes("?") ? "&" : "?"}orderId=${order.id}`,
      };
    }

    const callbackBaseUrl = getCallbackBaseUrl();
    if (!callbackBaseUrl) {
      await captureOperationalAlert({
        source: "checkout.paystack_initialize",
        severity: "critical",
        message: "NEXT_PUBLIC_APP_URL is required in production for Paystack callback URL",
        context: { orderId },
      });
      return { success: false, error: "Payment callback URL is not configured. Set NEXT_PUBLIC_APP_URL." };
    }

    const callbackUrl = new URL(`/checkout/success?orderId=${encodeURIComponent(orderId)}`, callbackBaseUrl).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.email,
        amount: order.totalAmount * 100,
        currency: "NGN",
        callback_url: callbackUrl,
        metadata: {
          orderId: order.id,
        },
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const raw = await response.text();
    const data = raw ? JSON.parse(raw) : null;

    if (!response.ok || !data?.status || !data?.data?.authorization_url) {
      await captureOperationalAlert({
        source: "checkout.paystack_initialize",
        severity: "warning",
        message: data?.message || `Failed to initialize payment (${response.status})`,
        context: { orderId, status: response.status, paystackResponse: data ?? raw },
      });
      throw new Error(data?.message || "Failed to initialize payment");
    }

    return { 
      success: true, 
      authorization_url: data.data.authorization_url 
    };
  } catch (error: any) {
    await captureOperationalAlert({
      source: "checkout.paystack_initialize",
      severity: "critical",
      message: error?.message || "Payment initialization failed",
      context: { orderId },
    });
    console.error("Payment initialization failed:", error);
    return { success: false, error: error.message };
  }
}
