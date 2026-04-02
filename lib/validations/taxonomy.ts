import { z } from "zod";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const SlugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .transform((value) => slugify(value));

export const CategoryMutationSchema = z.object({
  name: z.string().trim().min(2, "Category name is required"),
  slug: SlugSchema,
  image: z.string().trim().url("Category image must be a valid URL"),
});

export const BrandMutationSchema = z.object({
  name: z.string().trim().min(2, "Brand name is required"),
  slug: SlugSchema,
  image: z.string().trim().url("Brand image must be a valid URL").optional().nullable(),
});

export type CategoryMutationInput = z.infer<typeof CategoryMutationSchema>;
export type BrandMutationInput = z.infer<typeof BrandMutationSchema>;
