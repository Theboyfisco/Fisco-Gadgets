import test from "node:test";
import assert from "node:assert/strict";
import { CreateOrderSchema } from "@/lib/validations/order";

const validPayload = {
  email: "buyer@example.com",
  phone: "08030000000",
  items: [{ productId: "p1", quantity: 1 }],
  shipping: {
    fullName: "John Doe",
    address: "12 Example Street, Asaba",
    city: "Asaba",
    state: "Delta",
    shippingType: "DELIVERY" as const,
  },
};

test("CreateOrderSchema accepts valid payload", () => {
  const parsed = CreateOrderSchema.safeParse(validPayload);
  assert.equal(parsed.success, true);
});

test("CreateOrderSchema rejects invalid email", () => {
  const parsed = CreateOrderSchema.safeParse({
    ...validPayload,
    email: "invalid-email",
  });
  assert.equal(parsed.success, false);
});

test("CreateOrderSchema rejects missing delivery address", () => {
  const parsed = CreateOrderSchema.safeParse({
    ...validPayload,
    shipping: {
      ...validPayload.shipping,
      address: "",
    },
  });
  assert.equal(parsed.success, false);
});

test("CreateOrderSchema allows pickup without address", () => {
  const parsed = CreateOrderSchema.safeParse({
    ...validPayload,
    shipping: {
      ...validPayload.shipping,
      shippingType: "LOCAL_PICKUP" as const,
      address: "",
    },
  });
  assert.equal(parsed.success, true);
});
