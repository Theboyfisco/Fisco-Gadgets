import test, { expect } from "@playwright/test";
import crypto from "node:crypto";

function extractLastNairaAmount(text: string) {
  const matches = [...text.matchAll(/₦\s?([\d,]+(?:\.\d+)?)/g)];
  if (matches.length === 0) return null;
  const last = matches[matches.length - 1]?.[1];
  if (!last) return null;
  return Number(last.replace(/,/g, ""));
}

async function createPendingOrder(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /View Product/i }).first().click();
  await page.getByRole("button", { name: /Add to Cart/i }).first().click();
  await page.getByRole("link", { name: /Secure Checkout/i }).first().click();

  await page.fill('input[name="fullName"]', "E2E Buyer");
  await page.fill('input[name="email"]', "e2e.buyer@example.com");
  await page.fill('input[name="phone"]', "08030000000");
  await page.fill('input[name="city"]', "Asaba");
  await page.fill('textarea[name="address"]', "12 Example Street, Asaba");

  await page.getByRole("button", { name: /Continue to Payment/i }).click();
  await page.getByRole("button", { name: /Initialize Payment/i }).click();
  await page.waitForURL(/\/checkout\/success\?orderId=/, { timeout: 60_000 });

  const url = new URL(page.url());
  const orderId = url.searchParams.get("orderId");
  if (!orderId) {
    throw new Error("Order id missing from success URL");
  }

  const bodyText = await page.locator("body").innerText();
  const totalNaira = extractLastNairaAmount(bodyText);
  if (!totalNaira) {
    throw new Error("Unable to parse order total from success page");
  }

  return { orderId, totalNaira };
}

test.describe("commerce flow", () => {
  test.beforeEach(() => {
    test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required for e2e commerce flow tests.");
  });

  test("cart -> checkout -> payment redirect reaches success URL", async ({ page }) => {
    const order = await createPendingOrder(page);
    expect(order.orderId).toBeTruthy();
    await expect(page.getByText(/Payment Pending|Payment Received|Order Cancelled/i)).toBeVisible();
  });

  test("webhook confirmation updates pending order to paid", async ({ page, request }) => {
    const { orderId, totalNaira } = await createPendingOrder(page);
    await expect(page.getByText(/Payment Pending/i)).toBeVisible();

    const payload = JSON.stringify({
      event: "charge.success",
      data: {
        metadata: { orderId },
        reference: `e2e_${Date.now()}`,
        amount: Math.round(totalNaira * 100),
      },
    });

    const secret = process.env.PAYSTACK_SECRET_KEY || "e2e_test_secret";
    const signature = crypto.createHmac("sha512", secret).update(payload).digest("hex");

    const response = await request.post("/api/paystack/webhook", {
      data: payload,
      headers: {
        "content-type": "application/json",
        "x-paystack-signature": signature,
      },
    });
    expect(response.ok()).toBeTruthy();

    await page.reload();
    await expect(page.getByText(/Payment Received/i)).toBeVisible();
  });
});
