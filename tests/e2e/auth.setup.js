import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { STORAGE_STATE } from '../../playwright.config.js'

/**
 * Signs in once with the throwaway account from .env.test.local and saves the
 * session for the `authed` project. Credentials never live in the repo — see
 * .env.test.example.
 */
setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_EMAIL
  const password = process.env.E2E_PASSWORD

  setup.skip(
    !email || !password,
    'Set E2E_EMAIL and E2E_PASSWORD in .env.test.local to run the signed-in suite.',
  )

  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('.login-submit-btn').click()

  // PublicRoute sends a signed-in user to their role's landing spot.
  await page.waitForURL(/\/(dashboard|choose-test|admin|tutor)/, { timeout: 30_000 })
  await expect(page.locator('#root')).not.toBeEmpty()

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true })
  await page.context().storageState({ path: STORAGE_STATE })
})
