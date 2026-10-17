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

test('about page is reachable from the header', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('banner').getByRole('link', { name: 'Nosotros' }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(
    page.getByRole('region', { name: /quiénes somos/i }).getByRole('article'),
  ).toHaveCount(4)
})
