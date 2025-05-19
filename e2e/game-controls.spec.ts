import { test, expect } from '@playwright/test'

/**
 * Basic tests for game controls functionality
 */
test.describe('Game Controls', () => {
  test('should have all control buttons', async ({ page }) => {
    // Increase timeout for setup
    test.setTimeout(30000)

    // Go to the main page
    await page.goto('/')
    await page.waitForTimeout(1000) // Give app time to initialize

    // Check if we have a Race Controls section
    await expect(page.getByText('Race Controls')).toBeVisible({ timeout: 5000 })

    // Check all control buttons are present
    await page.waitForSelector('.lucide-play', { timeout: 5000 })
    await page.waitForSelector('.lucide-skip-forward', { timeout: 5000 })
    await page.waitForSelector('.lucide-ban', { timeout: 5000 })
    await page.waitForSelector('.lucide-memory-stick', { timeout: 5000 })

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/game-controls.png' })
  })

  test('should generate championship and enable buttons', async ({ page }) => {
    // Go to the main page
    test.setTimeout(30000)
    await page.goto('/')
    await page.waitForTimeout(1000)

    // Find and click the generate button
    const generateButton = page
      .getByRole('button')
      .filter({ has: page.locator('.lucide-memory-stick') })
    await generateButton.waitFor({ timeout: 5000 })
    await generateButton.click()

    // Verify race track appears
    await page.waitForSelector('h2', { timeout: 10000 })

    // Check that the play button is enabled
    const startButton = page.getByRole('button').filter({ has: page.locator('.lucide-play') })
    await expect(startButton).toBeEnabled({ timeout: 5000 })

    // Next round should be disabled
    const nextButton = page
      .getByRole('button')
      .filter({ has: page.locator('.lucide-skip-forward') })
    await expect(nextButton).toBeDisabled({ timeout: 5000 })

    // Take a screenshot
    await page.screenshot({ path: 'test-results/generated-championship.png' })
  })
})
