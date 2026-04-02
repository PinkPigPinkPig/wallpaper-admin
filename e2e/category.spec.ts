import { test, expect } from "@playwright/test";
import { login, cleanupCategory, ADMIN_USERNAME, ADMIN_PASSWORD, samplePngPath } from "./fixtures/helpers";

test.describe("Category", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("category list loads with seeded data", async ({ page }) => {
    await page.goto("/admin/category");
    await expect(page.locator(".ant-table")).toBeVisible({ timeout: 10000 });
    const rows = await page.locator(".ant-table-tbody tr").count();
    expect(rows).toBeGreaterThan(0);
  });

  test("create category with thumbnail upload", async ({ page }) => {
    const categoryName = `Test Category ${Date.now()}`;

    await page.goto("/admin/category/create");
    await page.fill('input[name="category.name"]', categoryName);

    // Upload thumbnail
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(samplePngPath());

    await page.locator("button[type='submit'], button:has-text('Save')").first().click();
    await expect(page).toHaveURL("**/admin/category", { timeout: 15000 });
    await expect(
      page.locator(`.ant-table`, { hasText: categoryName })
    ).toBeVisible({ timeout: 5000 });

    // Cleanup — find category ID from table
    const rows = await page.locator(".ant-table-tbody tr").all();
    for (const row of rows) {
      const text = await row.textContent();
      if (text?.includes(categoryName)) {
        await row.click();
        await expect(page).toHaveURL("**/admin/category/**/detail");
        const match = page.url().match(/\/category\/(\d+)\/detail/);
        if (match) {
          await cleanupCategory(page, parseInt(match[1]));
        }
        break;
      }
    }
  });

  test("category detail view is read-only", async ({ page }) => {
    await page.goto("/admin/category");
    await page.locator(".ant-table-tbody tr").first().click();
    await expect(page).toHaveURL("**/admin/category/**/detail", { timeout: 5000 });
    const disabledInputs = await page.locator(
      "input[disabled], input[readonly]"
    ).count();
    expect(disabledInputs).toBeGreaterThan(0);
  });
});
