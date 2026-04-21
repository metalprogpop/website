import { test, expect } from "@playwright/test";

test("fan clú page loads with teaser and login form", async ({ page }) => {
  await page.goto("/fan-clu");
  await expect(
    page.getByRole("heading", { level: 1, name: /fan clú/i }),
  ).toBeVisible();
  await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /enviar/i })).toBeVisible();
});

test("fan clú shows confirmation after email submission", async ({ page }) => {
  await page.route("**/api/v1/auth/magic-link", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });
  await page.goto("/fan-clu");
  await page.getByPlaceholder(/email/i).fill("test@example.com");
  await page.getByRole("button", { name: /enviar/i }).click();
  await expect(page.getByText(/te enviamos/i)).toBeVisible();
});

test("fan clú shows error message with error query param", async ({ page }) => {
  await page.goto("/fan-clu?error=invalid");
  await expect(page.getByText(/inválido|expirado/i)).toBeVisible();
});
