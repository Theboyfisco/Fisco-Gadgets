"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { recordAdminAuditLog } from "@/lib/audit-log";
import { PromoMutationSchema, type PromoMutationInput } from "@/lib/validations/promo";

function formatActionError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A promo with this code already exists.";
    }
  }
  return error instanceof Error ? error.message : "Promo request failed.";
}

function revalidatePromoPaths() {
  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/promos");
}

function toDate(value?: string | null) {
  if (!value) return null;
  return new Date(value);
}

function normalizePromoInput(input: PromoMutationInput) {
  const normalizedCode = input.code.trim().toUpperCase();
  return {
    code: normalizedCode,
    description: input.description?.trim() || null,
    kind: input.kind,
    amount: input.kind === "FREE_SHIPPING" ? 0 : input.amount,
    minOrder: input.minOrder ?? null,
    active: input.active,
    startsAt: toDate(input.startsAt),
    endsAt: toDate(input.endsAt),
    maxUses: input.maxUses ?? null,
  };
}

export async function createPromoCode(input: PromoMutationInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const validated = PromoMutationSchema.parse(input);
    const payload = normalizePromoInput(validated);

    const promo = await prisma.promoCode.create({
      data: payload,
    });

    await recordAdminAuditLog({
      action: "promo.create",
      entityType: "promo_code",
      entityId: promo.id,
      after: {
        code: promo.code,
        description: promo.description,
        kind: promo.kind,
        amount: promo.amount,
        minOrder: promo.minOrder,
        startsAt: promo.startsAt?.toISOString() ?? null,
        endsAt: promo.endsAt?.toISOString() ?? null,
        maxUses: promo.maxUses,
        active: promo.active,
      },
    });

    revalidatePromoPaths();
    return { success: true, promoId: promo.id };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function updatePromoCode(promoId: string, input: PromoMutationInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const validated = PromoMutationSchema.parse(input);
    const payload = normalizePromoInput(validated);

    const existing = await prisma.promoCode.findUnique({
      where: { id: promoId },
    });
    if (!existing) {
      return { success: false, error: "Promo code not found." };
    }
    if (typeof payload.maxUses === "number" && payload.maxUses < existing.usedCount) {
      return { success: false, error: "Usage limit cannot be less than current usage count." };
    }

    const promo = await prisma.promoCode.update({
      where: { id: promoId },
      data: payload,
    });

    await recordAdminAuditLog({
      action: "promo.update",
      entityType: "promo_code",
      entityId: promo.id,
      before: {
        code: existing.code,
        description: existing.description,
        kind: existing.kind,
        amount: existing.amount,
        minOrder: existing.minOrder,
        startsAt: existing.startsAt?.toISOString() ?? null,
        endsAt: existing.endsAt?.toISOString() ?? null,
        maxUses: existing.maxUses,
        usedCount: existing.usedCount,
        active: existing.active,
      },
      after: {
        code: promo.code,
        description: promo.description,
        kind: promo.kind,
        amount: promo.amount,
        minOrder: promo.minOrder,
        startsAt: promo.startsAt?.toISOString() ?? null,
        endsAt: promo.endsAt?.toISOString() ?? null,
        maxUses: promo.maxUses,
        usedCount: promo.usedCount,
        active: promo.active,
      },
    });

    revalidatePromoPaths();
    return { success: true };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function deletePromoCode(promoId: string) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const existing = await prisma.promoCode.findUnique({
      where: { id: promoId },
    });
    if (!existing) {
      return { success: false, error: "Promo code not found." };
    }
    if (existing.usedCount > 0) {
      return { success: false, error: "Promo has usage history. Deactivate it instead of deleting." };
    }

    const linkedOrder = await prisma.order.findFirst({
      where: { promoCode: existing.code },
      select: { id: true },
    });
    if (linkedOrder) {
      return { success: false, error: "Promo is linked to orders. Deactivate it instead of deleting." };
    }

    await prisma.promoCode.delete({
      where: { id: promoId },
    });

    await recordAdminAuditLog({
      action: "promo.delete",
      entityType: "promo_code",
      entityId: promoId,
      before: {
        code: existing.code,
        description: existing.description,
        kind: existing.kind,
        amount: existing.amount,
        minOrder: existing.minOrder,
        startsAt: existing.startsAt?.toISOString() ?? null,
        endsAt: existing.endsAt?.toISOString() ?? null,
        maxUses: existing.maxUses,
        usedCount: existing.usedCount,
        active: existing.active,
      },
    });

    revalidatePromoPaths();
    return { success: true };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}
