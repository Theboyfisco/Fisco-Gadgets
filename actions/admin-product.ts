"use server";

import { Condition, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db";
import { ProductMutationSchema, type ProductMutationInput } from "@/lib/validations/product";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { recordAdminAuditLog } from "@/lib/audit-log";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function revalidateProductPaths(productId: string, productSlug: string, categoryId: string, categorySlug?: string | null, brandSlug?: string | null) {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/catalog");
  revalidatePath(`/product/${productId}`);
  revalidatePath(`/product/${productSlug}`);
  revalidatePath(`/category/${categoryId}`);
  if (categorySlug && categorySlug !== categoryId) {
    revalidatePath(`/category/${categorySlug}`);
  }
  if (brandSlug) {
    revalidatePath(`/brand/${brandSlug}`);
  }
  revalidatePath("/brand/[id]", "page");
}

type ProductActionContext = "save" | "delete";

function formatActionError(error: unknown, context: ProductActionContext = "save") {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A product with this slug already exists.";
    }
    if (error.code === "P2003") {
      if (context === "delete") {
        return "This product is connected to existing orders and cannot be deleted.";
      }
      return "A referenced category or brand could not be found. Check category/brand values and try again.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return context === "delete" ? "Something went wrong while deleting the product." : "Something went wrong while saving the product.";
}

function normalizeProductInput(input: ProductMutationInput): ProductMutationInput {
  return {
    ...input,
    slug: slugify(input.slug || input.name),
    images: input.images.map((image) => image.trim()).filter(Boolean),
    technicalSpecs: Object.fromEntries(
      Object.entries(input.technicalSpecs)
        .map(([key, value]) => [key.trim(), typeof value === "string" ? value.trim() : value])
        .filter(([key, value]) => key && String(value).trim().length > 0),
    ),
    brandId: input.brandId ? input.brandId.trim() : null,
  };
}

const BulkProductIdsSchema = z.array(z.string().trim().min(1)).min(1, "Select at least one product.");

const BulkProductUpdateSchema = z
  .object({
    categoryId: z.string().trim().min(1).optional(),
    brandId: z.string().trim().min(1).nullable().optional(),
    condition: z.nativeEnum(Condition).optional(),
    price: z.number().int().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "No update fields were provided.");

type BulkProductUpdateInput = z.infer<typeof BulkProductUpdateSchema>;

export async function createProduct(input: ProductMutationInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const validated = ProductMutationSchema.parse(normalizeProductInput(input));

    const product = await prisma.product.create({
      data: validated,
      include: { category: { select: { slug: true } }, brand: { select: { slug: true } } },
    });

    revalidateProductPaths(product.id, product.slug, product.categoryId, product.category?.slug, product.brand?.slug);
    await recordAdminAuditLog({
      action: "product.create",
      entityType: "product",
      entityId: product.id,
      after: {
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        brandId: product.brandId,
        images: validated.images,
        technicalSpecs: validated.technicalSpecs,
      },
    });
    return { success: true, productId: product.id };
  } catch (error) {
    return { success: false, error: formatActionError(error, "save") };
  }
}

export async function updateProduct(productId: string, input: ProductMutationInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const validated = ProductMutationSchema.parse(normalizeProductInput(input));

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        slug: true,
        name: true,
        price: true,
        stock: true,
        brandId: true,
        images: true,
        technicalSpecs: true,
      },
    });

    if (!existing) {
      return { success: false, error: "Product not found." };
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: validated,
      include: { category: { select: { slug: true } }, brand: { select: { slug: true } } },
    });

    revalidateProductPaths(product.id, product.slug, product.categoryId, product.category?.slug, product.brand?.slug);
    if (existing.categoryId !== product.categoryId) {
      revalidatePath(`/category/${existing.categoryId}`);
    }

    await recordAdminAuditLog({
      action: "product.update",
      entityType: "product",
      entityId: product.id,
      before: {
        name: existing.name,
        slug: existing.slug,
        price: existing.price,
        stock: existing.stock,
        categoryId: existing.categoryId,
        brandId: existing.brandId,
        images: existing.images,
        technicalSpecs: existing.technicalSpecs as Record<string, unknown>,
      },
      after: {
        name: product.name,
        slug: product.slug,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        brandId: product.brandId,
        images: validated.images,
        technicalSpecs: validated.technicalSpecs,
      },
    });

    return { success: true, productId: product.id };
  } catch (error) {
    return { success: false, error: formatActionError(error, "save") };
  }
}

export async function deleteProduct(productId: string) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        slug: true,
        name: true,
        price: true,
        stock: true,
        brandId: true,
        images: true,
        technicalSpecs: true,
        category: { select: { slug: true } },
        brand: { select: { slug: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Product not found." };
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/catalog");
    revalidatePath(`/product/${productId}`);
    revalidatePath(`/product/${existing.slug}`);
    revalidatePath(`/category/${existing.categoryId}`);
    if (existing.category?.slug && existing.category.slug !== existing.categoryId) {
      revalidatePath(`/category/${existing.category.slug}`);
    }
    if (existing.brand?.slug) {
      revalidatePath(`/brand/${existing.brand.slug}`);
    }
    revalidatePath("/brand/[id]", "page");

    await recordAdminAuditLog({
      action: "product.delete",
      entityType: "product",
      entityId: productId,
      before: {
        name: existing.name,
        slug: existing.slug,
        price: existing.price,
        stock: existing.stock,
        categoryId: existing.categoryId,
        brandId: existing.brandId,
        images: existing.images,
        technicalSpecs: existing.technicalSpecs as Record<string, unknown>,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: formatActionError(error, "delete") };
  }
}

export async function bulkUpsertProducts(inputs: ProductMutationInput[]) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    if (!Array.isArray(inputs) || inputs.length === 0) {
      return { success: false, error: "No products provided." };
    }

    const validatedInputs = inputs.map((input) => ProductMutationSchema.parse(normalizeProductInput(input)));

    // Keep only the last row per slug from the import payload.
    const inputsBySlug = new Map<string, ProductMutationInput>();
    for (const entry of validatedInputs) {
      inputsBySlug.set(entry.slug, entry);
    }
    const dedupedInputs = Array.from(inputsBySlug.values());

    const existingProducts = await prisma.product.findMany({
      where: { slug: { in: dedupedInputs.map((entry) => entry.slug) } },
      select: { slug: true },
    });
    const existingSlugs = new Set(existingProducts.map((entry) => entry.slug));

    let created = 0;
    let updated = 0;
    for (const entry of dedupedInputs) {
      await prisma.product.upsert({
        where: { slug: entry.slug },
        update: entry,
        create: entry,
      });
      if (existingSlugs.has(entry.slug)) {
        updated += 1;
      } else {
        created += 1;
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/category/[id]", "page");
    revalidatePath("/brand/[id]", "page");

    await recordAdminAuditLog({
      action: "product.bulk_upsert",
      entityType: "product",
      after: {
        count: dedupedInputs.length,
        created,
        updated,
      },
    });

    return { success: true, created, updated };
  } catch (error) {
    return { success: false, error: formatActionError(error, "save") };
  }
}

export async function bulkUpdateProducts(productIds: string[], input: BulkProductUpdateInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }

    const ids = Array.from(new Set(BulkProductIdsSchema.parse(productIds)));
    const validated = BulkProductUpdateSchema.parse({
      ...input,
      categoryId: input.categoryId?.trim() || undefined,
      brandId: input.brandId === null ? null : input.brandId?.trim() || undefined,
    });

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        slug: true,
        categoryId: true,
        brand: { select: { slug: true } },
      },
    });

    if (products.length === 0) {
      return { success: false, error: "No matching products were found." };
    }

    await prisma.product.updateMany({
      where: { id: { in: products.map((product) => product.id) } },
      data: validated,
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/admin/catalog");
    revalidatePath("/category/[id]", "page");
    revalidatePath("/brand/[id]", "page");

    for (const product of products) {
      revalidatePath(`/product/${product.id}`);
      revalidatePath(`/product/${product.slug}`);
      revalidatePath(`/category/${product.categoryId}`);
      if (product.brand?.slug) {
        revalidatePath(`/brand/${product.brand.slug}`);
      }
    }

    if (validated.categoryId) {
      revalidatePath(`/category/${validated.categoryId}`);
    }
    if (validated.brandId) {
      const nextBrand = await prisma.brand.findUnique({
        where: { id: validated.brandId },
        select: { slug: true },
      });
      if (nextBrand?.slug) {
        revalidatePath(`/brand/${nextBrand.slug}`);
      }
    }

    await recordAdminAuditLog({
      action: "product.bulk_update",
      entityType: "product",
      after: {
        count: products.length,
        productIds: products.map((product) => product.id),
        changes: validated,
      },
    });

    return { success: true, updated: products.length };
  } catch (error) {
    return { success: false, error: formatActionError(error, "save") };
  }
}

export async function bulkDeleteProducts(productIds: string[]) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again.", deleted: 0, blocked: [] as string[] };
    }

    const ids = Array.from(new Set(BulkProductIdsSchema.parse(productIds)));
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        slug: true,
        categoryId: true,
        brand: { select: { slug: true } },
      },
    });

    if (products.length === 0) {
      return { success: false, error: "No matching products were found.", deleted: 0, blocked: [] as string[] };
    }

    const deleted: string[] = [];
    const blocked: string[] = [];

    for (const product of products) {
      try {
        await prisma.product.delete({ where: { id: product.id } });
        deleted.push(product.id);
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
          blocked.push(product.name);
          continue;
        }
        throw error;
      }
    }

    if (deleted.length > 0) {
      revalidatePath("/");
      revalidatePath("/admin/products");
      revalidatePath("/admin/catalog");
      revalidatePath("/category/[id]", "page");
      revalidatePath("/brand/[id]", "page");
      for (const product of products) {
        revalidatePath(`/product/${product.id}`);
        revalidatePath(`/product/${product.slug}`);
        revalidatePath(`/category/${product.categoryId}`);
        if (product.brand?.slug) {
          revalidatePath(`/brand/${product.brand.slug}`);
        }
      }

      await recordAdminAuditLog({
        action: "product.bulk_delete",
        entityType: "product",
        after: {
          requestedCount: products.length,
          deletedCount: deleted.length,
          deletedIds: deleted,
          blockedNames: blocked,
        },
      });
    }

    if (deleted.length === 0) {
      return {
        success: false,
        error: "No selected products could be deleted because they are linked to orders.",
        deleted: 0,
        blocked,
      };
    }

    return {
      success: blocked.length === 0,
      deleted: deleted.length,
      blocked,
      error:
        blocked.length > 0
          ? `${blocked.length} product${blocked.length > 1 ? "s were" : " was"} skipped because they are linked to orders.`
          : undefined,
    };
  } catch (error) {
    return { success: false, error: formatActionError(error, "delete"), deleted: 0, blocked: [] as string[] };
  }
}
