import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { decrementPromoUsageByCode } from "@/services/promo-usage";

const CLEANUP_CRON_SECRET = process.env.CLEANUP_CRON_SECRET || process.env.CRON_SECRET || "";

export async function POST(request: NextRequest) {
  if (!CLEANUP_CRON_SECRET && process.env.NODE_ENV === "production") {
    return NextResponse.json({ status: "error", message: "Cleanup endpoint is not configured." }, { status: 503 });
  }

  if (CLEANUP_CRON_SECRET) {
    const secret = request.headers.get("x-cron-secret");
    if (secret !== CLEANUP_CRON_SECRET) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  const expiredOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      reservedUntil: { lt: now },
    },
    include: { items: true },
  });

  if (expiredOrders.length === 0) {
    return NextResponse.json({ status: "ok", cleaned: 0 });
  }

  await prisma.$transaction(async (tx) => {
    for (const order of expiredOrders) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", reservedUntil: null },
      });

      if (order.promoCode) {
        await decrementPromoUsageByCode({ dbClient: tx, promoCode: order.promoCode });
      }
    }
  });

  return NextResponse.json({ status: "ok", cleaned: expiredOrders.length });
}
