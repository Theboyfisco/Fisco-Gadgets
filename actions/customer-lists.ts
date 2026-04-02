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

  await prisma.$transaction(async (tx) => {
    if (uniqueIds.length === 0) {
      await tx.customerProductListItem.deleteMany({
        where: {
          customerId: customer.id,
          listType,
        },
      });
      return;
    }

    await tx.customerProductListItem.deleteMany({
      where: {
        customerId: customer.id,
        listType,
        productId: { notIn: uniqueIds },
      },
    });

    for (let index = 0; index < uniqueIds.length; index += 1) {
      const productId = uniqueIds[index];
      await tx.customerProductListItem.upsert({
        where: {
          customerId_productId_listType: {
            customerId: customer.id,
            productId,
            listType,
          },
        },
        update: {
          rank: index,
          quantity: null,
          updatedAt: new Date(),
        },
        create: {
          customerId: customer.id,
          productId,
          listType,
          rank: index,
          quantity: null,
        },
      });
    }
  });

  return { success: true, authenticated: true };
}

export async function trackRecentProduct(productId: string) {
  const customer = await getCurrentCustomer();
  if (!customer || !productId) {
    return { success: false, authenticated: false };
  }

  await prisma.$transaction(async (tx) => {
    await tx.customerProductListItem.upsert({
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

    const recents = await tx.customerProductListItem.findMany({
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
      await tx.customerProductListItem.deleteMany({
        where: { id: { in: overflow } },
      });
    }
  });

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

  await prisma.$transaction(async (tx) => {
    if (normalized.length === 0) {
      await tx.customerProductListItem.deleteMany({
        where: { customerId: customer.id, listType: "CART" },
      });
      return;
    }

    await tx.customerProductListItem.deleteMany({
      where: {
        customerId: customer.id,
        listType: "CART",
        productId: { notIn: normalized.map((item) => item.productId) },
      },
    });

    for (let index = 0; index < normalized.length; index += 1) {
      const item = normalized[index];
      await tx.customerProductListItem.upsert({
        where: {
          customerId_productId_listType: {
            customerId: customer.id,
            productId: item.productId,
            listType: "CART",
          },
        },
        update: {
          rank: index,
          quantity: item.quantity,
          updatedAt: new Date(),
        },
        create: {
          customerId: customer.id,
          productId: item.productId,
          listType: "CART",
          rank: index,
          quantity: item.quantity,
        },
      });
    }
  });

  return { success: true, authenticated: true };
}
