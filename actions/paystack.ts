"use server";

import prisma from "@/lib/db";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function initializePayment(orderId: string) {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack secret key is not configured");
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shippingDetails: true }
    });

    if (!order) throw new Error("Order not found");

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: order.email,
        amount: order.totalAmount, // amount in kobo
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
        metadata: {
          orderId: order.id,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Failed to initialize payment");
    }

    return { 
      success: true, 
      authorization_url: data.data.authorization_url 
    };
  } catch (error: any) {
    console.error("Payment initialization failed:", error);
    return { success: false, error: error.message };
  }
}
