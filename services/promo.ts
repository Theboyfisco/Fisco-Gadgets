export type PromoKind = "PERCENT" | "FIXED" | "FREE_SHIPPING";

export type PromoRule = {
  code: string;
  label: string;
  kind: PromoKind;
  amount: number;
  minOrder?: number;
  startsAt?: string;
  expiresAt?: string;
};

const STATIC_PROMOS: PromoRule[] = [
  {
    code: "SAVE10",
    label: "10% off orders above ₦200,000",
    kind: "PERCENT",
    amount: 10,
    minOrder: 200000,
  },
  {
    code: "FLASH50",
    label: "₦50,000 off orders above ₦500,000",
    kind: "FIXED",
    amount: 50000,
    minOrder: 500000,
  },
  {
    code: "SHIPFREE",
    label: "Free shipping on eligible delivery orders",
    kind: "FREE_SHIPPING",
    amount: 0,
  },
];

export type PromoComputation = {
  applied: boolean;
  code?: string;
  discountAmount: number;
  adjustedShippingFee: number;
  reason?: string;
};

export type PromoEvaluationInput = {
  code?: string | null;
  itemsTotal: number;
  shippingFee: number;
};

export function normalizePromoCode(code?: string | null) {
  return (code ?? "").trim().toUpperCase();
}

export function listPromoRules() {
  return STATIC_PROMOS;
}

export function evaluatePromoRule(rule: PromoRule, input: PromoEvaluationInput): PromoComputation {
  if (rule.minOrder && input.itemsTotal < rule.minOrder) {
    return {
      applied: false,
      discountAmount: 0,
      adjustedShippingFee: input.shippingFee,
      reason: `Promo requires at least ₦${rule.minOrder.toLocaleString()}.`,
    } satisfies PromoComputation;
  }

  if (rule.startsAt && new Date(rule.startsAt).getTime() > Date.now()) {
    return {
      applied: false,
      discountAmount: 0,
      adjustedShippingFee: input.shippingFee,
      reason: "Promo code is not active yet.",
    } satisfies PromoComputation;
  }

  if (rule.expiresAt && new Date(rule.expiresAt).getTime() < Date.now()) {
    return {
      applied: false,
      discountAmount: 0,
      adjustedShippingFee: input.shippingFee,
      reason: "Promo code expired.",
    } satisfies PromoComputation;
  }

  if (rule.kind === "FREE_SHIPPING") {
    return {
      applied: true,
      code: rule.code,
      discountAmount: input.shippingFee,
      adjustedShippingFee: 0,
    } satisfies PromoComputation;
  }

  if (rule.kind === "PERCENT") {
    const discountAmount = Math.round((input.itemsTotal * rule.amount) / 100);
    return {
      applied: true,
      code: rule.code,
      discountAmount,
      adjustedShippingFee: input.shippingFee,
    } satisfies PromoComputation;
  }

  return {
    applied: true,
    code: rule.code,
    discountAmount: Math.min(rule.amount, input.itemsTotal),
    adjustedShippingFee: input.shippingFee,
  } satisfies PromoComputation;
}

export function evaluatePromoCode(input: PromoEvaluationInput) {
  const normalized = normalizePromoCode(input.code);
  if (!normalized) {
    return {
      applied: false,
      discountAmount: 0,
      adjustedShippingFee: input.shippingFee,
    } satisfies PromoComputation;
  }

  const rule = STATIC_PROMOS.find((item) => item.code === normalized);
  if (!rule) {
    return {
      applied: false,
      discountAmount: 0,
      adjustedShippingFee: input.shippingFee,
      reason: "Promo code not found.",
    } satisfies PromoComputation;
  }

  return evaluatePromoRule(rule, input);
}
