import test from "node:test";
import assert from "node:assert/strict";
import { calculateShippingFee, estimateDeliveryWindow } from "@/services/shipping";

test("calculateShippingFee returns free shipping for Asaba delivery", () => {
  assert.equal(calculateShippingFee("Asaba", "Delta", "DELIVERY"), 0);
});

test("calculateShippingFee applies Lagos rate for Lagos state", () => {
  assert.equal(calculateShippingFee("Surulere", "Lagos", "DELIVERY"), 2000);
});

test("calculateShippingFee returns zero for local pickup", () => {
  assert.equal(calculateShippingFee("Lagos", "Lagos", "LOCAL_PICKUP"), 0);
});

test("estimateDeliveryWindow returns pickup timing for local pickup", () => {
  const eta = estimateDeliveryWindow("Asaba", "Delta", "LOCAL_PICKUP");
  assert.equal(eta.minDays, 0);
  assert.equal(eta.maxDays, 1);
});

test("estimateDeliveryWindow returns Abuja eta for Abuja deliveries", () => {
  const eta = estimateDeliveryWindow("Abuja", "FCT", "DELIVERY");
  assert.equal(eta.minDays, 2);
  assert.equal(eta.maxDays, 3);
});
