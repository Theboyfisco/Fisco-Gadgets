import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(body)
      .digest("hex");

    if (!signaturesMatch(hash, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (event.event === "charge.success") {
      const { metadata, reference, amount } = event.data;
      const orderId = metadata?.orderId;

      if (!orderId) {
        return NextResponse.json({ message: "No orderId in metadata" }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status === "PAID" && order.paymentReference === reference) {
        return NextResponse.json({ status: "success", message: "Already processed" });
      }

      if (order.status === "PAID" && order.paymentReference !== reference) {
        return NextResponse.json({ error: "Duplicate payment reference mismatch" }, { status: 409 });
      }

      if (order.totalAmount !== amount) {
        console.error(`Amount mismatch: Order ${orderId} expected ${order.totalAmount}, got ${amount}`);
        return NextResponse.json({ error: "Validation failed" }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentReference: reference,
        },
      });

      console.log(`Order ${orderId} marked as PAID via reference ${reference}`);
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
