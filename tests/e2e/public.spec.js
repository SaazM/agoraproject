import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { compressToEncodedURIComponent } from 'lz-string'
import { PUBLIC_ROUTES, PROTECTED_ROUTES, collectErrors } from './routes.js'

const encodeShare = (payload) => compressToEncodedURIComponent(JSON.stringify(payload))

test.describe('public pages', () => {
  test('landing page renders its hero and a way to sign in', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/')

    await expect(page.getByText('The Agora Project').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /sign in|log in|get started/i }).first()).toBeVisible()
    expect(errors, `console errors on /:\n${errors.join('\n')}`).toEqual([])
  })

  test('login page renders a usable sign-in form', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/login')

    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('.login-submit-btn')).toBeEnabled()
    expect(errors, `console errors on /login:\n${errors.join('\n')}`).toEqual([])
  })

  test('login form toggles to sign-up and asks for a name', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign up/i }).first().click()

    // Sign-up mode adds the full-name field that sign-in mode does not have.
    await expect(page.getByPlaceholder('Jane Smith')).toBeVisible()
  })

  test('signing in with an unknown account shows an error, not a crash', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('/login')

    // Deliberately invalid throwaway values — this asserts the failure path renders.
    await page.locator('input[type="email"]').fill('nobody-e2e@example.invalid')
    await page.locator('input[type="password"]').fill('not-a-real-password')
    await page.locator('.login-submit-btn').click()

    await expect(page.getByText(/invalid|incorrect|could not|error/i).first()).toBeVisible({ timeout: 15_000 })
    await expect(page).toHaveURL(/\/login/)
    expect(errors.filter((e) => e.startsWith('Uncaught'))).toEqual([])
  })

  // These two submit paths are rejected by client-side validation in Login.jsx
  // before signUp()/signIn() runs, so they never reach Supabase or create an account.
  test('rejects a malformed email before hitting the network', async ({ page }) => {
    await page.goto('/login')
    // Passes the browser's native type="email" check but fails the app's regex.
    await page.locator('input[type="email"]').fill('student@localhost')
    await page.locator('input[type="password"]').fill('long-enough-password')
    await page.locator('.login-submit-btn').click()

    await expect(page.getByText(/valid email address/i)).toBeVisible()
  })

  test('sign-up rejects a password under 8 characters', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign up/i }).first().click()
    await page.getByPlaceholder('Jane Smith').fill('E2E Tester')
    await page.locator('input[type="email"]').fill('nobody-e2e@example.invalid')
    await page.locator('input[type="password"]').fill('short')
    await page.locator('.login-submit-btn').click()

    // Blocked by the field's minLength before the app ever calls signUp().
    const tooShort = await page.locator('input[type="password"]').evaluate((el) => el.validity.tooShort)
    expect(tooShort).toBe(true)
    await expect(page).toHaveURL(/\/login/)
  })

  test('sign-in does not impose a minimum password length', async ({ page }) => {
    // Regression guard: an 8-char minimum on sign-in locks out any account whose
    // password predates that rule (Supabase's own floor is 6).
    await page.goto('/login')
    await page.locator('input[type="email"]').fill('nobody-e2e@example.invalid')
    await page.locator('input[type="password"]').fill('short')

    const blocked = await page.locator('input[type="password"]').evaluate((el) => el.validity.tooShort)
    expect(blocked, 'sign-in password field still enforces a minimum length').toBe(false)

    await page.locator('.login-submit-btn').click()
    // Reaches the server and comes back with a credentials error, not a length error.
    await expect(page.getByText(/at least 8 characters/i)).toHaveCount(0)
    await expect(page.getByText(/invalid|incorrect|could not|error/i).first()).toBeVisible({ timeout: 15_000 })
  })

  test('password reset page renders', async ({ page }) => {
    await page.goto('/reset')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('a valid share link renders the report card', async ({ page }) => {
    const errors = collectErrors(page)
    const payload = {
      generated_at: new Date('2026-01-01T12:00:00Z').toISOString(),
      student: { name: 'E2E Tester' },
      summary: {
        best_pretest: 1200,
        latest_post: 1350,
        improvement: 150,
        streak_current: 4,
        due_reviews: 2,
        studied_count: 9,
      },
      series: [],
    }
    await page.goto(`/share?r=${encodeShare(payload)}`)

    await expect(page.getByText('1200')).toBeVisible()
    await expect(page.getByText('+150')).toBeVisible()
    await expect(page.getByText(/Completed chapters/)).toBeVisible()
    expect(errors.filter((e) => e.startsWith('Uncaught'))).toEqual([])
  })

  // Regression: these payloads used to throw on `report.summary.<field>` and
  // blank the page instead of showing the "Invalid share link" card.
  const malformedPayloads = [
    ['no summary key', { generated_at: '2026-01-01T00:00:00Z', series: [] }],
    ['summary is null', { summary: null }],
    ['summary is a string', { summary: 'nope' }],
    ['empty object', {}],
  ]
  for (const [name, payload] of malformedPayloads) {
    test(`share link with ${name} shows the invalid-link card, not a crash`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(`/share?r=${encodeShare(payload)}`)

      await expect(page.getByText('Invalid share link')).toBeVisible()
      const uncaught = errors.filter((e) => e.startsWith('Uncaught'))
      expect(uncaught, `crashed on ${name}:\n${uncaught.join('\n')}`).toEqual([])
    })
  }

  test('share link with a garbage param shows the invalid-link card', async ({ page }) => {
    await page.goto('/share?r=not-real-compressed-data')
    await expect(page.getByText('Invalid share link')).toBeVisible()
  })

  test('unknown routes redirect to the landing page', async ({ page }) => {
    await page.goto('/this-route-does-not-exist')
    await page.waitForURL((url) => url.pathname === '/', { timeout: 15_000 })
  })

  for (const route of PUBLIC_ROUTES) {
    test(`public route ${route} loads without an uncaught error`, async ({ page }) => {
      const errors = collectErrors(page)
      await page.goto(route)
      await expect(page.locator('#root')).not.toBeEmpty()
      const uncaught = errors.filter((e) => e.startsWith('Uncaught'))
      expect(uncaught, `uncaught errors on ${route}:\n${uncaught.join('\n')}`).toEqual([])
    })
  }
})

test.describe('auth guards', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects a signed-out visitor to /login`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/\/login/, { timeout: 15_000 })
    })
  }
})

test('route inventory stays in sync with App.jsx', async () => {
  const appSource = fs.readFileSync(path.resolve('src/App.jsx'), 'utf8')
  const declared = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((p) => p !== '*')

  const known = new Set([
    ...PUBLIC_ROUTES,
    ...PROTECTED_ROUTES,
    '/admin',
    '/tutor',
    '/auth/callback',
    '/test/:attemptId',
    '/setup-plan/:attemptId',
    '/results/:attemptId',
  ])

  const untracked = declared.filter((p) => !known.has(p))
  expect(untracked, `App.jsx declares routes missing from tests/e2e/routes.js: ${untracked.join(', ')}`).toEqual([])
})
