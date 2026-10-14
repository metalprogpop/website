import { test, expect } from "@playwright/test";

test("an episode card opens the episode page with its player", async ({
  page,
}) => {
  await page.goto("/episodes");

  const firstCard = page.getByRole("heading", { level: 3 }).first();
  const title = (await firstCard.textContent()) ?? "";
  await firstCard.getByRole("link").click();

  await expect(page).toHaveURL(/\/episodes\/\d+-[a-z0-9-]+$/);
  // Only the episode page has this button; waiting for it first means the
  // list's own h1 is gone before the title is read.
  await expect(
    page.getByRole("button", { name: "Reproducir", exact: true }),
  ).toBeVisible();
  expect(title).toContain(
    (await page.getByRole("heading", { level: 1 }).textContent()) ?? "",
  );
  await expect(
    page.getByRole("heading", { name: /si te gustó este episodio/i }),
  ).toBeVisible();
});

test("an unknown episode says it was not found", async ({ page }) => {
  await page.goto("/episodes/99999-nada");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /no encontramos este episodio/i,
    }),
  ).toBeVisible();
});
