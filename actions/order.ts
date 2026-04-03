"use server";

import prisma from "@/lib/db";
import { CreateOrderSchema, type CreateOrderInput } from "@/lib/validations/order";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { captureOperationalAlert } from "@/lib/monitoring";
import { buildOrderDraft } from "@/services/order-creation";

export async function createOrder(input: CreateOrderInput) {
  // 1. Validate Input
  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid checkout payload",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const validated = parsed.data;
  const customer = await getCurrentCustomer();
  
  try {
    // 2. Start Transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // 3. Fetch product prices and verify stock
      const productIds = validated.items.map(i => i.productId);
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } }
      });

      if (dbProducts.length !== productIds.length) {
        throw new Error("One or more products not found");
      }

      const orderDraft = await buildOrderDraft({
        dbClient: tx,
        items: validated.items,
        products: dbProducts.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
        })),
        shipping: validated.shipping,
        promoCode: validated.promoCode,
      });

      if (orderDraft.promoId && orderDraft.promoSource === "database") {
        const reserveResult = await tx.promoCode.updateMany({
          where: {
            id: orderDraft.promoId,
            active: true,
            usedCount: orderDraft.promoUsedCount ?? undefined,
            OR: [
              { maxUses: null },
              { maxUses: { gt: orderDraft.promoUsedCount ?? -1 } },
            ],
          },
          data: {
            usedCount: { increment: 1 },
          },
        });

        if (reserveResult.count === 0) {
          throw new Error("Promo code usage limit reached. Please refresh and try again.");
        }
      }

      // 5. Create Order + Items + Shipping Details
      const order = await tx.order.create({
        data: {
          customerId: customer?.id,
          email: validated.email,
          phone: validated.phone,
          totalAmount: orderDraft.totalAmount,
          discountAmount: orderDraft.discountAmount,
          promoCode: orderDraft.promoCode,
          status: "PENDING",
          reservedUntil: orderDraft.reservedUntil,
          items: {
            create: orderDraft.orderItems
          },
          shippingDetails: {
            create: {
              fullName: validated.shipping.fullName,
              address: validated.shipping.address ?? "Local pickup",
              city: validated.shipping.city,
              state: validated.shipping.state,
              shippingType: validated.shipping.shippingType,
              shippingFee: orderDraft.shippingFee
            }
          }
        }
      });

      // 6. Update Stock (Atomic check to prevent race conditions)
      for (const item of validated.items) {
        const updateResult = await tx.product.updateMany({
          where: { 
            id: item.productId, 
            stock: { gte: item.quantity } 
          },
          data: { 
            stock: { decrement: item.quantity } 
          }
        });

        if (updateResult.count === 0) {
          throw new Error(`Insufficient stock for one or more items (race condition)`);
        }
      }

      return order.id;
    });

    return { success: true, orderId: result };
  } catch (error: any) {
    await captureOperationalAlert({
      source: "checkout.create_order",
      severity: "warning",
      message: error?.message || "Order creation failed",
      context: {
        email: validated.email,
        itemsCount: validated.items.length,
      },
    });
    console.error("Order creation failed:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}
