"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { recordAdminAuditLog } from "@/lib/audit-log";
import { decrementPromoUsageByCode } from "@/services/promo-usage";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    await requireAdmin();
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true, promoCode: true },
    });
    if (!existing) {
      return { success: false, error: "Order not found" };
    }
    if (existing.status === "CANCELLED" && status !== "CANCELLED") {
      return { success: false, error: "Cancelled orders are terminal and cannot be reopened." };
    }

    await prisma.$transaction(async (tx) => {
      if (status === "CANCELLED" && existing.status !== "CANCELLED" && existing.promoCode) {
        await decrementPromoUsageByCode({ dbClient: tx, promoCode: existing.promoCode });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });
    });

    await recordAdminAuditLog({
      action: "order.update_status",
      entityType: "order",
      entityId: orderId,
      before: { status: existing.status },
      after: { status },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Update failed" };
  }
}
