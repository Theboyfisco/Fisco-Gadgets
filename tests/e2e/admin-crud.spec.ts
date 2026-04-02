import test, { expect } from "@playwright/test";

const ADMIN_USERNAME = process.env.E2E_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.locator('input[type="text"]').first().fill(ADMIN_USERNAME || "");
  await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD || "");
  await page.getByRole("button", { name: /Continue/i }).click();
  await page.waitForURL(/\/admin\/products/, { timeout: 30_000 });
}

test.describe("admin CRUD", () => {
  test.beforeEach(() => {
    test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required for admin e2e tests.");
    test.skip(!ADMIN_USERNAME || !ADMIN_PASSWORD, "Set E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD for admin e2e tests.");
  });

  test("category and brand CRUD from admin catalog", async ({ page }) => {
    const suffix = Date.now().toString().slice(-6);
    const categoryName = `E2E Category ${suffix}`;
    const categorySlug = `e2e-category-${suffix}`;
    const brandName = `E2E Brand ${suffix}`;
    const brandSlug = `e2e-brand-${suffix}`;

    await loginAsAdmin(page);
    await page.goto("/admin/catalog");
    await expect(page.getByRole("heading", { name: /Manage category and brand taxonomy/i })).toBeVisible();

    const categoryPanel = page.locator("section").nth(1);
    await categoryPanel.getByRole("button", { name: /New/i }).click();
    await categoryPanel.locator("input").nth(0).fill(categoryName);
    await categoryPanel.locator("input").nth(1).fill(categorySlug);
    await categoryPanel.locator("input").nth(2).fill("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop");
    await categoryPanel.getByRole("button", { name: /Create/i }).click();
    await expect(page.getByText(categoryName)).toBeVisible({ timeout: 15_000 });
    page.once("dialog", (dialog) => dialog.accept());
    await categoryPanel.getByRole("button", { name: /Delete/i }).click();

    const brandPanel = page.locator("section").nth(2);
    await brandPanel.getByRole("button", { name: /New/i }).click();
    await brandPanel.locator("input").nth(0).fill(brandName);
    await brandPanel.locator("input").nth(1).fill(brandSlug);
    await brandPanel.locator("input").nth(2).fill("https://images.unsplash.com/photo-1556656793-08538906a9f8?q=80&w=800&auto=format&fit=crop");
    await brandPanel.getByRole("button", { name: /Create/i }).click();
    await expect(page.getByText(brandName)).toBeVisible({ timeout: 15_000 });
    page.once("dialog", (dialog) => dialog.accept());
    await brandPanel.getByRole("button", { name: /Delete/i }).click();
  });
});
