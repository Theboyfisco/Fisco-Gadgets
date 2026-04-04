import { Condition } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db";
import { isAdminSessionValid } from "@/lib/admin-auth";
import { ProductMutationSchema } from "@/lib/validations/product";
import { recordAdminAuditLog } from "@/lib/audit-log";

const ImportRowSchema = z.object({
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  condition: z.nativeEnum(Condition),
  categoryId: z.string(),
  brandValue: z.string().optional(),
  images: z.array(z.string()),
  technicalSpecs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});

const ImportBodySchema = z.object({
  rows: z.array(ImportRowSchema).min(1),
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function normalizeProductInput(input: z.infer<typeof ImportRowSchema> & { brandId: string | null }) {
  return {
    name: input.name.trim(),
    slug: slugify(input.slug || input.name),
    description: input.description.trim(),
    price: input.price,
    stock: input.stock,
    condition: input.condition,
    categoryId: input.categoryId.trim(),
    brandId: input.brandId ? input.brandId.trim() : null,
    images: input.images.map((image) => image.trim()).filter(Boolean),
    technicalSpecs: Object.fromEntries(
      Object.entries(input.technicalSpecs ?? {})
        .map(([key, value]) => [key.trim(), typeof value === "string" ? value.trim() : value])
        .filter(([key, value]) => key && String(value).trim().length > 0),
    ),
  };
}

async function createBrandWithUniqueSlug(name: string) {
  const baseSlug = slugify(name);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}_${attempt + 1}`;
    try {
      const created = await prisma.brand.create({
        data: {
          name,
          slug,
          image: null,
        },
        select: { id: true, name: true, slug: true },
      });
      return created;
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(`Could not create unique slug for brand "${name}"`);
}

export async function POST(request: Request) {
  if (!(await isAdminSessionValid())) {
    return Response.json({ success: false, error: "Admin session expired. Sign in again." }, { status: 401 });
  }

  try {
    const { rows } = ImportBodySchema.parse(await request.json());

    const categoryIds = Array.from(new Set(rows.map((row) => row.categoryId.trim()).filter(Boolean)));
    const existingCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true },
    });
    const existingCategoryIds = new Set(existingCategories.map((category) => category.id));
    const unknownCategories = categoryIds.filter((categoryId) => !existingCategoryIds.has(categoryId));
    if (unknownCategories.length > 0) {
      return Response.json(
        {
          success: false,
          error: `Unknown categories: ${unknownCategories.slice(0, 4).join(", ")}`,
        },
        { status: 400 },
      );
    }

    const brandNames = Array.from(
      new Set(
        rows
          .map((row) => row.brandValue?.trim() || "")
          .filter((value) => value.length > 0),
      ),
    );

    const existingBrands = await prisma.brand.findMany({
      where: brandNames.length > 0 ? { name: { in: brandNames } } : undefined,
      select: { id: true, name: true },
    });
    const brandsByLowerName = new Map(existingBrands.map((brand) => [brand.name.toLowerCase(), brand.id]));
    const createdBrands: Array<{ id: string; name: string }> = [];

    for (const brandName of brandNames) {
      if (brandsByLowerName.has(brandName.toLowerCase())) {
        continue;
      }
      const created = await createBrandWithUniqueSlug(brandName);
      brandsByLowerName.set(brandName.toLowerCase(), created.id);
      createdBrands.push({ id: created.id, name: created.name });
    }

    const normalizedBySlug = new Map<
      string,
      z.infer<typeof ProductMutationSchema>
    >();

    for (const row of rows) {
      const brandId = row.brandValue?.trim() ? brandsByLowerName.get(row.brandValue.trim().toLowerCase()) ?? null : null;
      const normalized = normalizeProductInput({ ...row, brandId });
      const validated = ProductMutationSchema.parse(normalized);
      normalizedBySlug.set(validated.slug, validated);
    }

    const dedupedInputs = Array.from(normalizedBySlug.values());
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
    revalidatePath("/admin/catalog");
    revalidatePath("/category/[id]", "page");
    revalidatePath("/brand/[id]", "page");

    await recordAdminAuditLog({
      action: "product.bulk_import_via_api",
      entityType: "product",
      after: {
        count: dedupedInputs.length,
        created,
        updated,
        createdBrands: createdBrands.map((brand) => brand.name),
      },
    });

    return Response.json({
      success: true,
      created,
      updated,
      createdBrands,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to import CSV right now.";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}
