"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ProductMutationSchema, type ProductMutationInput } from "@/lib/validations/product";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function revalidateProductPaths(productId: string, categoryId: string) {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath(`/product/${productId}`);
  revalidatePath(`/category/${categoryId}`);
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
  };
}

export async function createProduct(input: ProductMutationInput) {
  try {
    const validated = ProductMutationSchema.parse(normalizeProductInput(input));

    const product = await prisma.product.create({
      data: validated,
      include: { category: true },
    });

    revalidateProductPaths(product.id, product.categoryId);
    return { success: true, productId: product.id };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function updateProduct(productId: string, input: ProductMutationInput) {
  try {
    const validated = ProductMutationSchema.parse(normalizeProductInput(input));

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!existing) {
      return { success: false, error: "Product not found." };
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: validated,
      include: { category: true },
    });

    revalidateProductPaths(product.id, product.categoryId);
    if (existing.categoryId !== product.categoryId) {
      revalidatePath(`/category/${existing.categoryId}`);
    }

    return { success: true, productId: product.id };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!existing) {
      return { success: false, error: "Product not found." };
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${productId}`);
    revalidatePath(`/category/${existing.categoryId}`);
    revalidatePath("/brand/[id]", "page");

    return { success: true };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}
