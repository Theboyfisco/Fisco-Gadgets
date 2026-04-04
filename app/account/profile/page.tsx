import prisma from "@/lib/db";
import { requireCustomer } from "@/lib/customer-auth";
import { CustomerProfileConsole } from "@/components/account/CustomerProfileConsole";
import type { Prisma } from "@prisma/client";

const currencySafeValue = (value: number | null | undefined) => (typeof value === "number" ? value : 0);

export default async function AccountProfilePage() {
  const customer = await requireCustomer();
  const ordersWhere: Prisma.OrderWhereInput = {
    OR: [{ customerId: customer.id }, { email: customer.email }],
  };

  const [dbCustomer, totalOrders, paidOrders, cancelledOrders, totalSpentAgg, listCounts, latestShippingOrder, recentOrders] =
    await Promise.all([
      prisma.customer.findUnique({
        where: { id: customer.id },
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
        where: { customerId: customer.id },
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

  const listSummary = {
    wishlist: 0,
    compare: 0,
    recent: 0,
    savedForLater: 0,
    cart: 0,
  };

  for (const row of listCounts) {
    if (row.listType === "WISHLIST") listSummary.wishlist = row._count._all;
    if (row.listType === "COMPARE") listSummary.compare = row._count._all;
    if (row.listType === "RECENT") listSummary.recent = row._count._all;
    if (row.listType === "SAVE_FOR_LATER") listSummary.savedForLater = row._count._all;
    if (row.listType === "CART") listSummary.cart = row._count._all;
  }

  return (
    <CustomerProfileConsole
      customer={{
        fullName: dbCustomer?.fullName ?? customer.fullName ?? null,
        email: dbCustomer?.email ?? customer.email,
        createdAtIso: (dbCustomer?.createdAt ?? new Date()).toISOString(),
      }}
      orderSummary={{
        totalOrders,
        activeOrders: Math.max(totalOrders - cancelledOrders, 0),
        paidOrders,
        cancelledOrders,
        totalSpent: currencySafeValue(totalSpentAgg._sum?.totalAmount),
      }}
      listSummary={listSummary}
      latestShipping={
        latestShippingOrder?.shippingDetails
          ? {
              fullName: latestShippingOrder.shippingDetails.fullName,
              address: latestShippingOrder.shippingDetails.address,
              city: latestShippingOrder.shippingDetails.city,
              state: latestShippingOrder.shippingDetails.state,
              shippingType: latestShippingOrder.shippingDetails.shippingType,
            }
          : null
      }
      recentOrders={recentOrders.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        itemCount: order.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        createdAtIso: order.createdAt.toISOString(),
      }))}
    />
  );
}
