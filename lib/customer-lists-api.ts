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

const LISTS_CACHE_TTL_MS = 8000;
const LISTS_REQUEST_TIMEOUT_MS = 2500;
let cachedLists: CustomerListsResponse = EMPTY_LISTS;
let cachedListsAt = 0;
let inflightListsRequest: Promise<CustomerListsResponse> | null = null;

function invalidateListsCache() {
  cachedListsAt = 0;
}

export async function getCustomerListsClient(): Promise<CustomerListsResponse> {
  const now = Date.now();
  if (cachedListsAt && now - cachedListsAt < LISTS_CACHE_TTL_MS) {
    return cachedLists;
  }

  if (inflightListsRequest) {
    return inflightListsRequest;
  }

  try {
    inflightListsRequest = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), LISTS_REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch("/api/account/lists", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          cachedLists = EMPTY_LISTS;
          cachedListsAt = Date.now();
          return EMPTY_LISTS;
        }
        const data = (await response.json()) as CustomerListsResponse;
        cachedLists = data;
        cachedListsAt = Date.now();
        return data;
      } finally {
        clearTimeout(timeout);
      }
    })();

    return await inflightListsRequest;
  } catch {
    cachedLists = EMPTY_LISTS;
    cachedListsAt = Date.now();
    return EMPTY_LISTS;
  } finally {
    inflightListsRequest = null;
  }
}

export async function syncCustomerListClient(listType: CustomerListType, productIds: string[]) {
  try {
    const response = await fetch("/api/account/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "syncList", listType, productIds }),
    });
    invalidateListsCache();
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
    invalidateListsCache();
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
    invalidateListsCache();
    if (!response.ok) return { success: false, authenticated: false };
    return (await response.json()) as { success: boolean; authenticated: boolean };
  } catch {
    return { success: false, authenticated: false };
  }
}
