import { test, expect } from '@playwright/test'

/**
 * Basic smoke test for the Vue application
 */
test('visits the app root url and verifies the title', async ({ page }) => {
  // Increase timeout for this test
  test.setTimeout(30000)

  // Visit the app
  await page.goto('/')

  // Wait for the title to appear
  await expect(page.locator('h1')).toContainText('Horse Racing Championship', { timeout: 10000 })

  // Verify basic page structure is present - title is "Vite App" by default
  await expect(page).toHaveTitle('Horse Racing', { timeout: 5000 })

  // Take a screenshot of the app
  await page.screenshot({ path: 'test-results/app-homepage.png' })
})
