import test from "node:test";
import assert from "node:assert/strict";
import { assertStockAndBuildItems, buildOrderDraft } from "@/services/order-creation";

const sampleProducts = [
  { id: "p1", name: "Phone A", price: 500000, stock: 3 },
  { id: "p2", name: "Laptop B", price: 1500000, stock: 5 },
];

test("assertStockAndBuildItems computes orderItems and totals", () => {
  const result = assertStockAndBuildItems(
    [
      { productId: "p1", quantity: 1 },
      { productId: "p2", quantity: 2 },
    ],
    sampleProducts,
  );

  assert.equal(result.orderItems.length, 2);
  assert.equal(result.itemsTotal, 3500000);
});

test("assertStockAndBuildItems throws when stock is insufficient", () => {
  assert.throws(
    () => assertStockAndBuildItems([{ productId: "p1", quantity: 10 }], sampleProducts),
    /Insufficient stock/,
  );
});

test("buildOrderDraft applies promo and shipping adjustments", () => {
  const result = buildOrderDraft({
    items: [{ productId: "p2", quantity: 1 }],
    products: sampleProducts,
    shipping: { city: "Lagos", state: "Lagos", shippingType: "DELIVERY" },
    promoCode: "SAVE10",
  });

  assert.equal(result.shippingFee, 2000);
  assert.equal(result.discountAmount, 150000);
  assert.equal(result.totalAmount, 1352000);
  assert.equal(result.promoCode, "SAVE10");
});
