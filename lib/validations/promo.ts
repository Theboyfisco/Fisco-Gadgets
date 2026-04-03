import { z } from "zod";

const PromoDateSchema = z
  .string()
  .trim()
  .max(40)
  .optional()
  .nullable()
  .refine((value) => {
    if (!value) return true;
    return Number.isFinite(new Date(value).getTime());
  }, "Invalid date value.");

export const PromoMutationSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "Promo code must be at least 3 characters.")
      .max(32, "Promo code must be at most 32 characters.")
      .regex(/^[A-Za-z0-9_-]+$/, "Promo code can only include letters, numbers, hyphen, and underscore."),
    description: z.string().trim().max(120).optional().nullable(),
    kind: z.enum(["PERCENT", "FIXED", "FREE_SHIPPING"]),
    amount: z
      .number()
      .int("Amount must be a whole number.")
      .min(0, "Amount cannot be negative."),
    minOrder: z.number().int("Minimum order must be a whole number.").min(0, "Minimum order cannot be negative.").optional().nullable(),
    active: z.boolean().default(true),
    startsAt: PromoDateSchema,
    endsAt: PromoDateSchema,
    maxUses: z.number().int("Usage limit must be a whole number.").min(1, "Usage limit must be at least 1.").optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.kind === "PERCENT" && (value.amount < 1 || value.amount > 100)) {
      ctx.addIssue({
        code: "custom",
        message: "Percent promo amount must be between 1 and 100.",
        path: ["amount"],
      });
    }

    if (value.kind === "FIXED" && value.amount < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Fixed promo amount must be at least 1.",
        path: ["amount"],
      });
    }

    if (value.kind === "FREE_SHIPPING" && value.amount !== 0) {
      ctx.addIssue({
        code: "custom",
        message: "Free shipping promo amount must be 0.",
        path: ["amount"],
      });
    }

    const starts = value.startsAt ? new Date(value.startsAt).getTime() : null;
    const ends = value.endsAt ? new Date(value.endsAt).getTime() : null;
    if (starts && ends && ends <= starts) {
      ctx.addIssue({
        code: "custom",
        message: "End date must be after start date.",
        path: ["endsAt"],
      });
    }
  });

export type PromoMutationInput = z.infer<typeof PromoMutationSchema>;
