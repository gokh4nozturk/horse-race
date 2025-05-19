import { test, expect } from '@playwright/test'

/**
 * Basic smoke tests for the horse racing application
 */
test.describe('Horse Race Application', () => {
  test('should display the application and UI controls', async ({ page }) => {
    // Go to the main page
    await page.goto('/')

    // Check the title is visible
    await expect(page.locator('h1')).toContainText('Horse Racing Championship')

    // Wait for initialization
    await page.waitForTimeout(1000)

    // Look for the control panel
    await expect(page.getByText('Race Controls', { exact: true })).toBeVisible({ timeout: 5000 })

    // Verify control buttons are visible
    await page.waitForSelector('.lucide-play', { timeout: 5000 })
    await page.waitForSelector('.lucide-skip-forward', { timeout: 5000 })
    await page.waitForSelector('.lucide-ban', { timeout: 5000 })
    await page.waitForSelector('.lucide-memory-stick', { timeout: 5000 })

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/horse-race-application.png' })
  })

  test('should be able to generate races', async ({ page }) => {
    // Go to the main page
    await page.goto('/')

    // Wait for initialization
    await page.waitForTimeout(1000)

    // Find and click the generate button
    const generateButton = page
      .getByRole('button')
      .filter({ has: page.locator('.lucide-memory-stick') })
    await generateButton.waitFor({ timeout: 5000 })
    await generateButton.click()

    // Verify that a race track appears
    await page.waitForSelector('h2', { timeout: 10000 })

    // Verify the start button is enabled
    const startButton = page.getByRole('button').filter({ has: page.locator('.lucide-play') })
    await expect(startButton).toBeEnabled({ timeout: 5000 })

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/generated-races.png' })
  })
})
