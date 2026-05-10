import { test, expect } from "@playwright/test";

const TEST_EMAIL = "test@example.com";
const SERVER_URL =
  process.env.PLAYWRIGHT_SERVER_URL ?? "http://localhost:13001";

test.describe("fan-clu real-flow auth", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("page loads with teaser, login form, and dev test-user button", async ({
    page,
  }) => {
    await page.goto("/fan-clu");
    await expect(
      page.getByRole("heading", { level: 1, name: /fan clú/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar/i })).toBeVisible();
    await expect(page.getByTestId("dev-test-login")).toBeVisible();
  });

  test("test user button logs in instantly", async ({ page }) => {
    await page.goto("/fan-clu");
    await page.getByTestId("dev-test-login").click();
    await expect(page.getByText(/bienvenid/i)).toBeVisible();
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();
  });

  test("magic link viewer flow logs the user in", async ({ page, request }) => {
    const meBefore = await request.get(`${SERVER_URL}/api/v1/auth/me`);
    expect(meBefore.status()).toBe(401);

    await page.goto("/fan-clu");
    await page.getByTestId("dev-test-login").click();
    await expect(page.getByText(/bienvenid/i)).toBeVisible();
    await page.getByRole("button", { name: /cerrar sesión/i }).click();

    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await page.getByPlaceholder(/email/i).fill(TEST_EMAIL);
    await page.getByRole("button", { name: /enviar/i }).click();

    const link = page.getByTestId("dev-magic-link");
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    if (href === null) {
      throw new Error("magic link href missing");
    }

    await page.goto(href);
    await expect(page.getByText(/bienvenid/i)).toBeVisible();
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();
  });

  test("invalid token query param shows error banner", async ({ page }) => {
    await page.goto("/fan-clu?error=invalid");
    await expect(page.getByText(/inválido|expirado/i)).toBeVisible();
  });
});
