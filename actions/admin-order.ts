"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { recordAdminAuditLog } from "@/lib/audit-log";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    await requireAdmin();
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!existing) {
      return { success: false, error: "Order not found" };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
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
