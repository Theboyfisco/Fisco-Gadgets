"use client";

import type { CustomerListType } from "@prisma/client";

type CartSyncItem = { productId: string; quantity: number };

export type CustomerListsResponse = {
  authenticated: boolean;
  wishlist: any[];
  compare: any[];
  recent: any[];
  savedForLater: any[];
  cart: any[];
};

const EMPTY_LISTS: CustomerListsResponse = {
  authenticated: false,
  wishlist: [],
  compare: [],
  recent: [],
  savedForLater: [],
  cart: [],
};

export async function getCustomerListsClient(): Promise<CustomerListsResponse> {
  try {
    const response = await fetch("/api/account/lists", {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) return EMPTY_LISTS;
    const data = (await response.json()) as CustomerListsResponse;
    return data;
  } catch {
    return EMPTY_LISTS;
  }
}

export async function syncCustomerListClient(listType: CustomerListType, productIds: string[]) {
  try {
    const response = await fetch("/api/account/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "syncList", listType, productIds }),
    });
    if (!response.ok) return { success: false, authenticated: false };
    return (await response.json()) as { success: boolean; authenticated: boolean };
  } catch {
    return { success: false, authenticated: false };
  }
}

export async function syncCustomerCartClient(items: CartSyncItem[]) {
  try {
    const response = await fetch("/api/account/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "syncCart", items }),
    });
    if (!response.ok) return { success: false, authenticated: false };
    return (await response.json()) as { success: boolean; authenticated: boolean };
  } catch {
    return { success: false, authenticated: false };
  }
}

export async function trackRecentProductClient(productId: string) {
  try {
    const response = await fetch("/api/account/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trackRecent", productId }),
    });
    if (!response.ok) return { success: false, authenticated: false };
    return (await response.json()) as { success: boolean; authenticated: boolean };
  } catch {
    return { success: false, authenticated: false };
  }
}
