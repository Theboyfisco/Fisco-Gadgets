import type { Prisma } from "@prisma/client";
import { evaluatePromoCodeServer } from "@/services/promo-server";
import { calculateShippingFee } from "@/services/shipping";

export type StockProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

type ShippingInput = {
  city: string;
  state: string;
  shippingType: "LOCAL_PICKUP" | "DELIVERY";
};

export function assertStockAndBuildItems(items: OrderItemInput[], products: StockProduct[]) {
  let itemsTotal = 0;
  const orderItems = items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) {
      throw new Error("One or more products not found");
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const itemSubtotal = product.price * item.quantity;
    itemsTotal += itemSubtotal;

    return {
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: product.price,
    };
  });

  return { orderItems, itemsTotal };
}

export async function buildOrderDraft(input: {
  dbClient?: Pick<Prisma.TransactionClient, "promoCode">;
  items: OrderItemInput[];
  products: StockProduct[];
  shipping: ShippingInput;
  promoCode?: string | null;
}) {
  const { orderItems, itemsTotal } = assertStockAndBuildItems(input.items, input.products);
  const shippingFee = calculateShippingFee(input.shipping.city, input.shipping.state, input.shipping.shippingType);
  const promoResult = await evaluatePromoCodeServer({
    dbClient: input.dbClient,
    code: input.promoCode,
    itemsTotal,
    shippingFee,
  });

  if (input.promoCode && !promoResult.applied) {
    throw new Error(promoResult.reason || "Promo code is invalid.");
  }

  const adjustedShippingFee = promoResult.adjustedShippingFee;
  const discountAmount = promoResult.discountAmount;
  const totalAmount = itemsTotal + adjustedShippingFee - discountAmount;

  return {
    orderItems,
    itemsTotal,
    shippingFee: adjustedShippingFee,
    discountAmount,
    totalAmount,
    promoCode: promoResult.applied ? promoResult.code : null,
    promoId: promoResult.applied ? promoResult.promoId : undefined,
    promoUsedCount: promoResult.applied ? promoResult.promoUsedCount : undefined,
    promoMaxUses: promoResult.applied ? promoResult.promoMaxUses : undefined,
    promoSource: promoResult.source,
    reservedUntil: new Date(Date.now() + 30 * 60 * 1000),
  };
}
