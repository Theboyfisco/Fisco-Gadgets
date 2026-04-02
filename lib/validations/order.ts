import { z } from "zod";

export const OrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive(),
});

export const ShippingDetailsSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    address: z.string().trim().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    shippingType: z.enum(["LOCAL_PICKUP", "DELIVERY"]),
  })
  .superRefine((data, ctx) => {
    if (data.shippingType === "DELIVERY") {
      if (!data.address || data.address.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required for delivery",
          path: ["address"],
        });
      }
    }
  });

export const CreateOrderSchema = z.object({
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  items: z.array(OrderItemSchema).min(1, "Cart cannot be empty"),
  shipping: ShippingDetailsSchema,
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
