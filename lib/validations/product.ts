import { z } from "zod";
import { Condition } from "@prisma/client";

const technicalSpecValueSchema = z.union([z.string(), z.number(), z.boolean()]);

const technicalSpecsSchema = z.record(z.string().min(1), technicalSpecValueSchema).refine(
  (value) => Object.keys(value).length > 0,
  "Add at least one technical specification",
);

const productImageSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    if (value.startsWith("/")) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "Use valid image URLs or root-relative paths");

export const ProductMutationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z.string().trim().min(2, "Slug is required"),
  description: z.string().trim().min(8, "Description must be at least 8 characters"),
  price: z.number().int().nonnegative("Price must be zero or more"),
  stock: z.number().int().nonnegative("Stock must be zero or more"),
  condition: z.nativeEnum(Condition),
  categoryId: z.string().trim().min(1, "Choose a category"),
  brandId: z.string().trim().min(1).optional().nullable(),
  images: z.array(productImageSchema).min(1, "Add at least one image"),
  technicalSpecs: technicalSpecsSchema,
});

export type ProductMutationInput = z.infer<typeof ProductMutationSchema>;
