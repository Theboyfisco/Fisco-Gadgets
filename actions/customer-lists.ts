"use server";

import type { CustomerListType } from "@prisma/client";
import prisma from "@/lib/db";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";

const MAX_ITEMS: Record<CustomerListType, number> = {
  CART: 40,
  WISHLIST: 80,
  COMPARE: 4,
  RECENT: 12,
  SAVE_FOR_LATER: 80,
};

function mapProduct(product: any) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    stock: product.stock,
    image: getPrimaryImage(product.images),
    categoryId: product.categoryId,
    brandId: product.brandId ?? undefined,
    technicalSpecs: normalizeTechnicalSpecs(product.technicalSpecs),
  };
}

function mapCartRow(row: any) {
  return {
    product: mapProduct(row.product),
    quantity: row.quantity && row.quantity > 0 ? row.quantity : 1,
  };
}

async function filterExistingProductIds(productIds: string[]) {
  if (productIds.length === 0) return [];
  const existing = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true },
  });
  const existingSet = new Set(existing.map((item) => item.id));
  return productIds.filter((id) => existingSet.has(id));
}

export async function getCustomerLists() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return {
      authenticated: false,
      wishlist: [],
      compare: [],
      recent: [],
      savedForLater: [],
      cart: [],
    };
  }

  const rows = await prisma.customerProductListItem.findMany({
    where: { customerId: customer.id },
    include: {
      product: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  const groups = {
    wishlist: rows.filter((row) => row.listType === "WISHLIST").map((row) => mapProduct(row.product)),
    compare: rows.filter((row) => row.listType === "COMPARE").map((row) => mapProduct(row.product)),
    recent: rows.filter((row) => row.listType === "RECENT").map((row) => mapProduct(row.product)),
    savedForLater: rows.filter((row) => row.listType === "SAVE_FOR_LATER").map((row) => mapProduct(row.product)),
    cart: rows.filter((row) => row.listType === "CART").map((row) => mapCartRow(row)),
  };

  return {
    authenticated: true,
    ...groups,
  };
}

export async function syncCustomerList(listType: CustomerListType, productIds: string[]) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { success: false, authenticated: false };
  }

  const uniqueIds = Array.from(new Set(productIds.filter(Boolean))).slice(0, MAX_ITEMS[listType]);
  const validIds = await filterExistingProductIds(uniqueIds);

  await prisma.customerProductListItem.deleteMany({
    where: {
      customerId: customer.id,
      listType,
    },
  });

  if (validIds.length > 0) {
    await prisma.customerProductListItem.createMany({
      data: validIds.map((productId, index) => ({
        customerId: customer.id,
        productId,
        listType,
        rank: index,
        quantity: null,
      })),
      skipDuplicates: true,
    });
  }

  return { success: true, authenticated: true };
}

export async function trackRecentProduct(productId: string) {
  const customer = await getCurrentCustomer();
  if (!customer || !productId) {
    return { success: false, authenticated: false };
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true },
  });
  if (!existingProduct) {
    return { success: false, authenticated: true };
  }

  await prisma.customerProductListItem.upsert({
    where: {
      customerId_productId_listType: {
        customerId: customer.id,
        productId,
        listType: "RECENT",
      },
    },
    update: {
      updatedAt: new Date(),
    },
    create: {
      customerId: customer.id,
      productId,
      listType: "RECENT",
    },
  });

  const recents = await prisma.customerProductListItem.findMany({
    where: {
      customerId: customer.id,
      listType: "RECENT",
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: { id: true },
  });

  const overflow = recents.slice(MAX_ITEMS.RECENT).map((row) => row.id);
  if (overflow.length > 0) {
    await prisma.customerProductListItem.deleteMany({
      where: { id: { in: overflow } },
    });
  }

  return { success: true, authenticated: true };
}

export async function syncCustomerCart(items: Array<{ productId: string; quantity: number }>) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { success: false, authenticated: false };
  }

  const normalized = Array.from(
    new Map(
      items
        .filter((item) => item.productId && Number.isFinite(item.quantity) && item.quantity > 0)
        .map((item) => [item.productId, { productId: item.productId, quantity: Math.min(Math.max(1, item.quantity), 20) }]),
    ).values(),
  ).slice(0, MAX_ITEMS.CART);
  const validProductIds = await filterExistingProductIds(normalized.map((item) => item.productId));
  const validProductIdSet = new Set(validProductIds);
  const validItems = normalized.filter((item) => validProductIdSet.has(item.productId));

  await prisma.customerProductListItem.deleteMany({
    where: { customerId: customer.id, listType: "CART" },
  });

  if (validItems.length > 0) {
    await prisma.customerProductListItem.createMany({
      data: validItems.map((item, index) => ({
        customerId: customer.id,
        productId: item.productId,
        listType: "CART",
        rank: index,
        quantity: item.quantity,
      })),
      skipDuplicates: true,
    });
  }

  return { success: true, authenticated: true };
}
