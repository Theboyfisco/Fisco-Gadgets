import { NextRequest, NextResponse } from "next/server";
import { evaluatePromoCodeServer, listCheckoutPromoRules } from "@/services/promo-server";

export const runtime = "nodejs";

function toSafeNumber(input: string | null, fallback = 0) {
  if (!input) return fallback;
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const itemsTotal = toSafeNumber(request.nextUrl.searchParams.get("itemsTotal"));
  const shippingFee = toSafeNumber(request.nextUrl.searchParams.get("shippingFee"));

  const [rules, evaluation] = await Promise.all([
    listCheckoutPromoRules(),
    evaluatePromoCodeServer({ code, itemsTotal, shippingFee }),
  ]);

  return NextResponse.json(
    {
      rules,
      evaluation,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
