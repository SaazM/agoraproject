import { test, expect } from '@playwright/test'
import { PROTECTED_ROUTES, collectErrors } from './routes.js'

const HAS_CREDENTIALS = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD)

test.skip(!HAS_CREDENTIALS, 'Set E2E_EMAIL and E2E_PASSWORD in .env.test.local to run the signed-in suite.')

test.describe('signed-in app', () => {
  test('dashboard loads with the user shell', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/dashboard')

    await expect(page.getByText('The Agora Project').first()).toBeVisible()
    await expect(page.locator('.app-layout')).toBeVisible()
    expect(errors, `console errors on /dashboard:\n${errors.join('\n')}`).toEqual([])
  })

  test('dashboard hero is compact and has no scrolling marquee', async ({ page }) => {
    await page.goto('/dashboard')

    const title = page.getByText('The Agora Project').first()
    await expect(title).toBeVisible()

    // Regression guard: the hero title used to render up to 52px and dominate the page.
    const fontSize = await title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(fontSize).toBeLessThanOrEqual(34)

    // The rotating resource marquee was removed; these labels should not appear
    // as a scrolling strip under the hero.
    await expect(page.getByText('Mistake Notebook', { exact: true })).toHaveCount(0)
  })

  test('page body never scrolls horizontally', async ({ page }) => {
    await page.goto('/dashboard')
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflows, 'the dashboard scrolls sideways').toBe(false)
  })

  for (const route of PROTECTED_ROUTES) {
    test(`${route} renders for a signed-in user`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(route)

      // A guard bounce back to /login means the saved session did not apply.
      await expect(page).not.toHaveURL(/\/login/)
      await expect(page.locator('#root')).not.toBeEmpty()

      const uncaught = errors.filter((e) => e.startsWith('Uncaught'))
      expect(uncaught, `uncaught errors on ${route}:\n${uncaught.join('\n')}`).toEqual([])
    })
  }

  test('sidebar links all resolve to a real page', async ({ page }) => {
    await page.goto('/dashboard')
    const hrefs = await page
      .locator('.app-layout a[href^="/"]')
      .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')))])

    expect(hrefs.length, 'no internal links found in the app shell').toBeGreaterThan(0)

    for (const href of hrefs) {
      await page.goto(href)
      // The catch-all route silently sends unknown paths to the landing page.
      await expect(page, `${href} fell through to the catch-all route`).not.toHaveURL(
        (url) => url.pathname === '/' && href !== '/',
      )
    }
  })
})
