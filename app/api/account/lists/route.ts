import { NextResponse } from "next/server";
import type { CustomerListType } from "@prisma/client";
import { getCustomerLists, syncCustomerCart, syncCustomerList, trackRecentProduct } from "@/actions/customer-lists";

const LIST_TYPES: CustomerListType[] = ["CART", "WISHLIST", "COMPARE", "RECENT", "SAVE_FOR_LATER"];

function isCustomerListType(value: unknown): value is CustomerListType {
  return typeof value === "string" && LIST_TYPES.includes(value as CustomerListType);
}

export async function GET() {
  try {
    const data = await getCustomerLists();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
        wishlist: [],
        compare: [],
        recent: [],
        savedForLater: [],
        cart: [],
      },
      { status: 200 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as
      | {
          action: "syncList";
          listType: CustomerListType;
          productIds: string[];
        }
      | {
          action: "syncCart";
          items: Array<{ productId: string; quantity: number }>;
        }
      | {
          action: "trackRecent";
          productId: string;
        };

    if (body?.action === "syncList") {
      if (!isCustomerListType(body.listType)) {
        return NextResponse.json({ success: false, authenticated: false }, { status: 400 });
      }
      const productIds = Array.isArray(body.productIds) ? body.productIds.filter((value) => typeof value === "string") : [];
      const result = await syncCustomerList(body.listType, productIds);
      return NextResponse.json(result);
    }

    if (body?.action === "syncCart") {
      const items = Array.isArray(body.items)
        ? body.items
            .filter((item) => item && typeof item.productId === "string" && Number.isFinite(Number(item.quantity)))
            .map((item) => ({ productId: item.productId, quantity: Number(item.quantity) }))
        : [];
      const result = await syncCustomerCart(items);
      return NextResponse.json(result);
    }

    if (body?.action === "trackRecent") {
      const productId = typeof body.productId === "string" ? body.productId : "";
      const result = await trackRecentProduct(productId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, authenticated: false }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, authenticated: false }, { status: 500 });
  }
}
