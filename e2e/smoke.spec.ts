import { test, expect } from '@playwright/test'

test('landing page loads with hero heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('episodes page loads', async ({ page }) => {
  await page.goto('/episodes')
  await expect(
    page.getByRole('heading', { level: 1, name: /todos los episodios/i }),
  ).toBeVisible()
})
