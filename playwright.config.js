import { defineConfig, devices } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// Load E2E credentials from .env.test.local (gitignored) without adding a dotenv dependency.
const envFile = path.resolve('.env.test.local')
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  }
}

const PORT = Number(process.env.E2E_PORT || 5299)
export const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`
export const STORAGE_STATE = path.resolve('tests/e2e/.auth/user.json')

// Without credentials the signed-in suite is skipped, so don't point Playwright
// at a storage-state file that will never be written.
const HAS_CREDENTIALS = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD)

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Signs in once and saves the session so authed specs don't each pay the login cost.
    { name: 'setup', testMatch: /auth\.setup\.js/ },
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /public\.spec\.js/,
    },
    {
      name: 'authed',
      use: {
        ...devices['Desktop Chrome'],
        ...(HAS_CREDENTIALS ? { storageState: STORAGE_STATE } : {}),
      },
      testMatch: /authed\.spec\.js/,
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      // iPhone form factor on Chromium: keeps `npm test` to a single browser
      // download. Run with --project=mobile-webkit after `npx playwright
      // install webkit` if you need real Safari behaviour.
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
      testMatch: /responsive\.spec\.js/,
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
