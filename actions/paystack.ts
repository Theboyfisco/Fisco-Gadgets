"use server";

import prisma from "@/lib/db";
import { captureOperationalAlert } from "@/lib/monitoring";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_MOCK_AUTH_URL = process.env.PAYSTACK_MOCK_AUTH_URL;

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

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.email,
        amount: order.totalAmount * 100, // amount in kobo
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
        metadata: {
          orderId: order.id,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      await captureOperationalAlert({
        source: "checkout.paystack_initialize",
        severity: "warning",
        message: data.message || "Failed to initialize payment",
        context: { orderId, paystackResponse: data },
      });
      throw new Error(data.message || "Failed to initialize payment");
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
