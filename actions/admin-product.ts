"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
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

function formatActionError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return "A product with this slug already exists.";
    }
    if (error.code === "P2003") {
      return "This product is connected to existing orders and cannot be deleted.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while saving the product.";
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
    return { success: false, error: formatActionError(error) };
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
    return { success: false, error: formatActionError(error) };
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
    return { success: false, error: formatActionError(error) };
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

    const result = await prisma.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;
      for (const entry of validatedInputs) {
        const existing = await tx.product.findUnique({ where: { slug: entry.slug }, select: { id: true } });
        if (existing) {
          await tx.product.update({ where: { id: existing.id }, data: entry });
          updated += 1;
        } else {
          await tx.product.create({ data: entry });
          created += 1;
        }
      }
      return { created, updated };
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath("/category/[id]", "page");
    revalidatePath("/brand/[id]", "page");

    await recordAdminAuditLog({
      action: "product.bulk_upsert",
      entityType: "product",
      after: {
        count: validatedInputs.length,
        created: result.created,
        updated: result.updated,
      },
    });

    return { success: true, ...result };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}
