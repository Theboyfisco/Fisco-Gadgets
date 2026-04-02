import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { captureOperationalAlert } from "@/lib/monitoring";
import { recordAnalyticsEvent } from "@/lib/analytics";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

function signaturesMatch(expectedHex: string, receivedHex: string) {
  const hexPattern = /^[a-f0-9]+$/i;
  if (!hexPattern.test(receivedHex) || receivedHex.length !== expectedHex.length) return false;

  const expected = Buffer.from(expectedHex, "hex");
  const received = Buffer.from(receivedHex, "hex");

  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature || !PAYSTACK_SECRET_KEY) {
      await captureOperationalAlert({
        source: "paystack.webhook",
        severity: "critical",
        message: "Missing webhook signature or Paystack key",
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (!signaturesMatch(hash, signature)) {
      await captureOperationalAlert({
        source: "paystack.webhook",
        severity: "warning",
        message: "Invalid webhook signature",
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      await captureOperationalAlert({
        source: "paystack.webhook",
        severity: "warning",
        message: "Invalid webhook payload",
      });
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (event.event === "charge.success") {
      const { metadata, reference, amount } = event.data;
      const orderId = metadata?.orderId;

      if (!orderId) {
        await captureOperationalAlert({
          source: "paystack.webhook",
          severity: "warning",
          message: "Missing orderId in webhook metadata",
          context: { reference },
        });
        return NextResponse.json({ message: "No orderId in metadata" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        await captureOperationalAlert({
          source: "paystack.webhook",
          severity: "warning",
          message: "Order not found for webhook",
          context: { orderId, reference },
        });
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status === "PAID" && order.paymentReference === reference) {
        return NextResponse.json({ status: "success", message: "Already processed" });
      }

      if (order.status === "PAID" && order.paymentReference !== reference) {
        await captureOperationalAlert({
          source: "paystack.webhook",
          severity: "warning",
          message: "Duplicate payment reference mismatch",
          context: { orderId, existingReference: order.paymentReference, incomingReference: reference },
        });
        return NextResponse.json({ error: "Duplicate payment reference mismatch" }, { status: 409 });
      }

      if (order.totalAmount * 100 !== amount) {
        console.error(`Amount mismatch: Order ${orderId} expected ${order.totalAmount * 100}, got ${amount}`);
        await captureOperationalAlert({
          source: "paystack.webhook",
          severity: "critical",
          message: "Amount mismatch during webhook validation",
          context: { orderId, expectedAmount: order.totalAmount * 100, receivedAmount: amount, reference },
        });
        return NextResponse.json({ error: "Validation failed" }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentReference: reference,
          reservedUntil: null,
        },
      });

      await recordAnalyticsEvent({
        name: "payment_success",
        path: "/api/paystack/webhook",
        userType: "system",
        payload: {
          orderId,
          reference,
          amount,
        },
      });

      console.log(`Order ${orderId} marked as PAID via reference ${reference}`);
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    await captureOperationalAlert({
      source: "paystack.webhook",
      severity: "critical",
      message: error?.message || "Webhook handler error",
    });
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
