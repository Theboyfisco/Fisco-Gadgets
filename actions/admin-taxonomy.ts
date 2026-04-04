"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { recordAdminAuditLog } from "@/lib/audit-log";
import {
  BrandMutationSchema,
  CategoryMutationSchema,
  type BrandMutationInput,
  type CategoryMutationInput,
} from "@/lib/validations/taxonomy";

function formatActionError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return "Name or slug already exists.";
    if (error.code === "P2003") return "Cannot delete because related products still exist.";
  }
  return error instanceof Error ? error.message : "Request failed.";
}

function revalidateTaxonomyPaths() {
  revalidatePath("/");
  revalidatePath("/admin/products");
  revalidatePath("/admin/catalog");
  revalidatePath("/category/[id]", "page");
  revalidatePath("/brand/[id]", "page");
}

export async function createCategory(input: CategoryMutationInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const validated = CategoryMutationSchema.parse(input);
    const category = await prisma.category.create({ data: validated });
    await recordAdminAuditLog({
      action: "category.create",
      entityType: "category",
      entityId: category.id,
      after: validated,
    });
    revalidateTaxonomyPaths();
    return { success: true, categoryId: category.id };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function updateCategory(categoryId: string, input: CategoryMutationInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const validated = CategoryMutationSchema.parse(input);
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) return { success: false, error: "Category not found." };

    await prisma.category.update({
      where: { id: categoryId },
      data: validated,
    });
    await recordAdminAuditLog({
      action: "category.update",
      entityType: "category",
      entityId: categoryId,
      before: { name: existing.name, slug: existing.slug, image: existing.image },
      after: validated,
    });
    revalidateTaxonomyPaths();
    return { success: true };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) return { success: false, error: "Category not found." };

    await prisma.category.delete({ where: { id: categoryId } });
    await recordAdminAuditLog({
      action: "category.delete",
      entityType: "category",
      entityId: categoryId,
      before: { name: existing.name, slug: existing.slug, image: existing.image },
    });
    revalidateTaxonomyPaths();
    return { success: true };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function createBrand(input: BrandMutationInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const validated = BrandMutationSchema.parse({
      ...input,
      image: input.image ? input.image.trim() : null,
    });
    const brand = await prisma.brand.create({ data: validated });
    await recordAdminAuditLog({
      action: "brand.create",
      entityType: "brand",
      entityId: brand.id,
      after: validated,
    });
    revalidateTaxonomyPaths();
    return { success: true, brandId: brand.id };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function updateBrand(brandId: string, input: BrandMutationInput) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const validated = BrandMutationSchema.parse({
      ...input,
      image: input.image ? input.image.trim() : null,
    });
    const existing = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!existing) return { success: false, error: "Brand not found." };

    await prisma.brand.update({
      where: { id: brandId },
      data: validated,
    });
    await recordAdminAuditLog({
      action: "brand.update",
      entityType: "brand",
      entityId: brandId,
      before: { name: existing.name, slug: existing.slug, image: existing.image },
      after: validated,
    });
    revalidateTaxonomyPaths();
    return { success: true };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}

export async function deleteBrand(brandId: string) {
  try {
    if (!(await isAdminSessionValid())) {
      return { success: false, error: "Admin session expired. Sign in again." };
    }
    const existing = await prisma.brand.findUnique({ where: { id: brandId } });
    if (!existing) return { success: false, error: "Brand not found." };

    await prisma.brand.delete({ where: { id: brandId } });
    await recordAdminAuditLog({
      action: "brand.delete",
      entityType: "brand",
      entityId: brandId,
      before: { name: existing.name, slug: existing.slug, image: existing.image },
    });
    revalidateTaxonomyPaths();
    return { success: true };
  } catch (error) {
    return { success: false, error: formatActionError(error) };
  }
}
