import { test, expect } from '@playwright/test'
import { PUBLIC_ROUTES, collectErrors } from './routes.js'

// Runs under the iPhone 13 device profile (see the `mobile` project in playwright.config.js).
test.describe('mobile layout', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} does not scroll sideways on a phone`, async ({ page }) => {
      await page.goto(route)
      await expect(page.locator('#root')).not.toBeEmpty()

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }))
      expect(
        overflow.scrollWidth,
        `${route} overflows by ${overflow.scrollWidth - overflow.clientWidth}px`,
      ).toBeLessThanOrEqual(overflow.clientWidth + 1)
    })
  }

  test('login form is usable on a phone', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/login')

    const email = page.locator('input[type="email"]')
    await expect(email).toBeVisible()
    await email.tap()
    await email.fill('phone-layout@example.invalid')
    await expect(email).toHaveValue('phone-layout@example.invalid')

    // Tap targets should clear the ~44px accessibility floor.
    const submit = page.locator('.login-submit-btn')
    const box = await submit.boundingBox()
    expect(box?.height ?? 0, 'sign-in button is too short to tap comfortably').toBeGreaterThanOrEqual(40)

    expect(errors.filter((e) => e.startsWith('Uncaught'))).toEqual([])
  })
})
