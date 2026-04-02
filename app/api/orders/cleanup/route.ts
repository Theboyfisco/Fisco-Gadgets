import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST() {
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
    }
  });

  return NextResponse.json({ status: "ok", cleaned: expiredOrders.length });
}
