import { test, expect } from "@playwright/test";
import { E2E_MAGIC_LINK_EMAIL } from "./global-setup";

const TEST_EMAIL = "test@example.com";
const SERVER_URL =
  process.env.PLAYWRIGHT_SERVER_URL ?? "http://localhost:13001";

test.describe("fan-clu real-flow auth", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("home shows how to join, the login form and the Hall of Fans", async ({
    page,
  }) => {
    await page.goto("/fan-clu");
    await expect(
      page.getByRole("heading", { level: 1, name: /fan clú/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /ars 5000/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /enviar/i })).toBeVisible();
    await expect(page.getByTestId("dev-test-login")).toBeVisible();
    await expect(
      page.getByRole("region", { name: /hall of fans/i }),
    ).toBeVisible();
  });

  // The test user may be a fan or staff depending on the database, so check
  // only what both views show.
  test("test user button logs in instantly", async ({ page }) => {
    await page.goto("/fan-clu");
    await page.getByTestId("dev-test-login").click();
    await expect(page.getByText(TEST_EMAIL)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /cerrar sesión/i }),
    ).toBeVisible();
  });

  test("magic link viewer flow logs the user in", async ({ page, request }) => {
    const meBefore = await request.get(`${SERVER_URL}/api/v1/auth/me`);
    expect(meBefore.status()).toBe(401);

    await page.goto("/fan-clu");
    await page.getByTestId("dev-test-login").click();
    await page.getByRole("button", { name: /cerrar sesión/i }).click();

    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    // A test user would log in without a link; use a regular one.
    await page.getByPlaceholder(/email/i).fill(E2E_MAGIC_LINK_EMAIL);
    await page.getByRole("button", { name: /enviar/i }).click();

    const link = page.getByTestId("dev-magic-link");
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toBeTruthy();
    if (href === null) {
      throw new Error("magic link href missing");
    }

    // The e2e user is a fan without a subscription: signed in, on the home.
    await page.goto(href);
    await expect(page.getByText(/iniciaste sesión/i)).toBeVisible();
    await expect(page.getByText(E2E_MAGIC_LINK_EMAIL)).toBeVisible();
  });

  test("invalid token query param shows error banner", async ({ page }) => {
    await page.goto("/fan-clu?error=invalid");
    await expect(page.getByText(/inválido|expirado/i)).toBeVisible();
  });
});
