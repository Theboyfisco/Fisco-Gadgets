import type { Prisma, PromoCode as PrismaPromoCode } from "@prisma/client";
import prisma from "@/lib/db";
import { shouldUseDatabase } from "@/lib/should-use-database";
import {
  evaluatePromoCode,
  evaluatePromoRule,
  listPromoRules,
  normalizePromoCode,
  type PromoComputation,
  type PromoEvaluationInput,
  type PromoRule,
} from "@/services/promo";

type PromoDbClient = Pick<Prisma.TransactionClient, "promoCode"> | Pick<typeof prisma, "promoCode">;

type PromoCodeRow = Pick<
  PrismaPromoCode,
  "id" | "code" | "description" | "kind" | "amount" | "minOrder" | "active" | "startsAt" | "endsAt" | "maxUses" | "usedCount"
>;

export type ServerPromoComputation = PromoComputation & {
  promoId?: string;
  promoUsedCount?: number;
  promoMaxUses?: number | null;
  source: "database" | "static" | "none";
};

type EvaluatePromoServerInput = PromoEvaluationInput & {
  dbClient?: PromoDbClient;
};

function getPromoClient(dbClient?: PromoDbClient) {
  return dbClient ?? prisma;
}

function mapPromoCodeToRule(promo: PromoCodeRow): PromoRule {
  return {
    code: promo.code,
    label: promo.description?.trim() || promo.code,
    kind: promo.kind,
    amount: promo.amount,
    minOrder: promo.minOrder ?? undefined,
    startsAt: promo.startsAt?.toISOString(),
    expiresAt: promo.endsAt?.toISOString(),
  };
}

function isPromoActiveNow(promo: PromoCodeRow, now = Date.now()) {
  if (!promo.active) return false;
  if (promo.startsAt && promo.startsAt.getTime() > now) return false;
  if (promo.endsAt && promo.endsAt.getTime() < now) return false;
  if (typeof promo.maxUses === "number" && promo.usedCount >= promo.maxUses) return false;
  return true;
}

async function findPromoCodeByCode(code: string, dbClient?: PromoDbClient) {
  if (!shouldUseDatabase()) return null;
  const promoClient = getPromoClient(dbClient);
  return promoClient.promoCode.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
    },
    select: {
      id: true,
      code: true,
      description: true,
      kind: true,
      amount: true,
      minOrder: true,
      active: true,
      startsAt: true,
      endsAt: true,
      maxUses: true,
      usedCount: true,
    },
  });
}

export async function listCheckoutPromoRules(options?: { dbClient?: PromoDbClient }) {
  const staticRules = listPromoRules();
  if (!shouldUseDatabase()) {
    return staticRules;
  }

  const promoClient = getPromoClient(options?.dbClient);
  const rows = await promoClient.promoCode.findMany({
    where: { active: true },
    select: {
      id: true,
      code: true,
      description: true,
      kind: true,
      amount: true,
      minOrder: true,
      active: true,
      startsAt: true,
      endsAt: true,
      maxUses: true,
      usedCount: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const now = Date.now();
  const activeDbRules = rows.filter((row) => isPromoActiveNow(row, now)).map(mapPromoCodeToRule);
  const seen = new Set(activeDbRules.map((rule) => normalizePromoCode(rule.code)));
  const merged = [...activeDbRules];
  for (const rule of staticRules) {
    const normalized = normalizePromoCode(rule.code);
    if (seen.has(normalized)) continue;
    merged.push(rule);
  }
  return merged;
}

export async function evaluatePromoCodeServer(input: EvaluatePromoServerInput): Promise<ServerPromoComputation> {
  const normalized = normalizePromoCode(input.code);
  if (!normalized) {
    return {
      applied: false,
      discountAmount: 0,
      adjustedShippingFee: input.shippingFee,
      source: "none",
    };
  }

  const promo = await findPromoCodeByCode(normalized, input.dbClient);
  if (promo) {
    if (!promo.active) {
      return {
        applied: false,
        discountAmount: 0,
        adjustedShippingFee: input.shippingFee,
        reason: "Promo code is inactive.",
        source: "database",
      };
    }
    if (promo.startsAt && promo.startsAt.getTime() > Date.now()) {
      return {
        applied: false,
        discountAmount: 0,
        adjustedShippingFee: input.shippingFee,
        reason: "Promo code is not active yet.",
        source: "database",
      };
    }
    if (promo.endsAt && promo.endsAt.getTime() < Date.now()) {
      return {
        applied: false,
        discountAmount: 0,
        adjustedShippingFee: input.shippingFee,
        reason: "Promo code expired.",
        source: "database",
      };
    }
    if (typeof promo.maxUses === "number" && promo.usedCount >= promo.maxUses) {
      return {
        applied: false,
        discountAmount: 0,
        adjustedShippingFee: input.shippingFee,
        reason: "Promo code has reached its usage limit.",
        source: "database",
      };
    }

    const computation = evaluatePromoRule(mapPromoCodeToRule(promo), input);
    return {
      ...computation,
      promoId: promo.id,
      promoUsedCount: promo.usedCount,
      promoMaxUses: promo.maxUses,
      code: promo.code,
      source: "database",
    };
  }

  const fallback = evaluatePromoCode(input);
  return {
    ...fallback,
    source: fallback.applied ? "static" : "none",
  };
}
