import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { normalizePromoCode } from "@/services/promo";

type PromoDbClient = Pick<Prisma.TransactionClient, "promoCode"> | Pick<typeof prisma, "promoCode">;

function getPromoClient(dbClient?: PromoDbClient) {
  return dbClient ?? prisma;
}

export async function decrementPromoUsageByCode(input: {
  dbClient?: PromoDbClient;
  promoCode?: string | null;
}) {
  const normalizedCode = normalizePromoCode(input.promoCode);
  if (!normalizedCode) {
    return { changed: false as const };
  }

  const promoClient = getPromoClient(input.dbClient);
  const promo = await promoClient.promoCode.findFirst({
    where: { code: { equals: normalizedCode, mode: "insensitive" } },
    select: { id: true, code: true, usedCount: true },
  });

  if (!promo || promo.usedCount <= 0) {
    return { changed: false as const };
  }

  const update = await promoClient.promoCode.updateMany({
    where: {
      id: promo.id,
      usedCount: { gt: 0 },
    },
    data: {
      usedCount: { decrement: 1 },
    },
  });

  return {
    changed: update.count > 0,
    promoId: promo.id,
    code: promo.code,
  };
}
