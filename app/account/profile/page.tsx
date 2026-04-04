import prisma from "@/lib/db";
import { requireCustomer } from "@/lib/customer-auth";
import { CustomerProfileConsole } from "@/components/account/CustomerProfileConsole";
import type { Prisma } from "@prisma/client";

const currencySafeValue = (value: number | null | undefined) => (typeof value === "number" ? value : 0);

async function loadProfileData(customerId: string, ordersWhere: Prisma.OrderWhereInput) {
  const [dbCustomer, totalOrders, paidOrders, cancelledOrders, totalSpentAgg, listCounts, latestShippingOrder, recentOrders] =
    await Promise.all([
      prisma.customer.findUnique({
        where: { id: customerId },
        select: {
          fullName: true,
          email: true,
          createdAt: true,
        },
      }),
      prisma.order.count({ where: ordersWhere }),
      prisma.order.count({
        where: {
          ...ordersWhere,
          status: { in: ["PAID", "SHIPPED"] },
        },
      }),
      prisma.order.count({
        where: {
          ...ordersWhere,
          status: "CANCELLED",
        },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          ...ordersWhere,
          status: { in: ["PAID", "SHIPPED"] },
        },
      }),
      prisma.customerProductListItem.groupBy({
        by: ["listType"],
        where: { customerId },
        _count: { _all: true },
      }),
      prisma.order.findFirst({
        where: {
          ...ordersWhere,
          shippingDetails: { isNot: null },
        },
        orderBy: { createdAt: "desc" },
        select: {
          shippingDetails: {
            select: {
              fullName: true,
              address: true,
              city: true,
              state: true,
              shippingType: true,
            },
          },
        },
      }),
      prisma.order.findMany({
        where: ordersWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
            },
          },
        },
      }),
    ] as const);

  return {
    dbCustomer,
    totalOrders,
    paidOrders,
    cancelledOrders,
    totalSpentAgg,
    listCounts,
    latestShippingOrder,
    recentOrders,
  };
}

type ProfileData = Awaited<ReturnType<typeof loadProfileData>>;

export default async function AccountProfilePage() {
  const customer = await requireCustomer();
  const ordersWhere: Prisma.OrderWhereInput = {
    OR: [{ customerId: customer.id }, { email: customer.email }],
  };

  let dataWarning: string | null = null;
  const fallbackData: ProfileData = {
    dbCustomer: null,
    totalOrders: 0,
    paidOrders: 0,
    cancelledOrders: 0,
    totalSpentAgg: { _sum: { totalAmount: 0 } } as ProfileData["totalSpentAgg"],
    listCounts: [],
    latestShippingOrder: null,
    recentOrders: [],
  };

  let profileData = fallbackData;
  try {
    profileData = await loadProfileData(customer.id, ordersWhere);
  } catch (error) {
    console.error("Failed to load customer profile data", error);
    dataWarning = "Some profile details could not be loaded. Try refreshing the page.";
  }

  const listSummary = {
    wishlist: 0,
    compare: 0,
    recent: 0,
    savedForLater: 0,
    cart: 0,
  };

  for (const row of profileData.listCounts) {
    if (row.listType === "WISHLIST") listSummary.wishlist = row._count._all;
    if (row.listType === "COMPARE") listSummary.compare = row._count._all;
    if (row.listType === "RECENT") listSummary.recent = row._count._all;
    if (row.listType === "SAVE_FOR_LATER") listSummary.savedForLater = row._count._all;
    if (row.listType === "CART") listSummary.cart = row._count._all;
  }

  return (
    <CustomerProfileConsole
      customer={{
        fullName: profileData.dbCustomer?.fullName ?? customer.fullName ?? null,
        email: profileData.dbCustomer?.email ?? customer.email,
        createdAtIso: (profileData.dbCustomer?.createdAt ?? new Date()).toISOString(),
      }}
      orderSummary={{
        totalOrders: profileData.totalOrders,
        activeOrders: Math.max(profileData.totalOrders - profileData.cancelledOrders, 0),
        paidOrders: profileData.paidOrders,
        cancelledOrders: profileData.cancelledOrders,
        totalSpent: currencySafeValue(profileData.totalSpentAgg._sum?.totalAmount),
      }}
      listSummary={listSummary}
      dataWarning={dataWarning}
      latestShipping={
        profileData.latestShippingOrder?.shippingDetails
          ? {
              fullName: profileData.latestShippingOrder.shippingDetails.fullName,
              address: profileData.latestShippingOrder.shippingDetails.address,
              city: profileData.latestShippingOrder.shippingDetails.city,
              state: profileData.latestShippingOrder.shippingDetails.state,
              shippingType: profileData.latestShippingOrder.shippingDetails.shippingType,
            }
          : null
      }
      recentOrders={profileData.recentOrders.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        itemCount: order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        createdAtIso: order.createdAt.toISOString(),
      }))}
    />
  );
}
