"use server";

import prisma from "@/lib/db";
import { CreateOrderSchema, type CreateOrderInput } from "@/lib/validations/order";
import { calculateShippingFee } from "@/services/shipping";

export async function createOrder(input: CreateOrderInput) {
  // 1. Validate Input
  const validated = CreateOrderSchema.parse(input);
  
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

      // 4. Calculate Totals (Never trust client prices)
      let itemsTotal = 0;
      const orderItems = validated.items.map(item => {
        const product = dbProducts.find((p: any) => p.id === item.productId)!;
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const itemSubtotal = product.price * item.quantity;
        itemsTotal += itemSubtotal;

        return {
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: product.price // kobo
        };
      });

      const shippingFee = calculateShippingFee(validated.shipping.city);
      const totalAmount = itemsTotal + shippingFee;

      // 5. Create Order + Items + Shipping Details
      const order = await tx.order.create({
        data: {
          email: validated.email,
          phone: validated.phone,
          totalAmount: totalAmount,
          status: "PENDING",
          items: {
            create: orderItems
          },
          shippingDetails: {
            create: {
              fullName: validated.shipping.fullName,
              address: validated.shipping.address,
              city: validated.shipping.city,
              state: validated.shipping.state,
              shippingType: validated.shipping.shippingType,
              shippingFee: shippingFee
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
    console.error("Order creation failed:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}
