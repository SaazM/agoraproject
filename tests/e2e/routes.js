/**
 * Route inventory mirrored from src/App.jsx. Keep in sync when routes change —
 * the `route table is complete` test in public.spec.js fails when they drift.
 */

export const PUBLIC_ROUTES = ['/', '/login', '/reset', '/share']

/** Routes behind <ProtectedRoute>; each redirects to /login when signed out. */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/choose-test',
  '/welcome',
  '/pick-test-date',
  '/prior-score',
  '/overview',
  '/guide',
  '/strategies',
  '/final',
  '/mistakes',
  '/report',
  '/calendar',
  '/about',
  '/practice',
  '/extra-tests',
  '/tasks',
  '/journey',
  '/settings',
  '/college-recruiting',
  '/formulas',
]

/** Protected routes that need a real record id, so they can't be swept blindly. */
export const PARAMETERIZED_ROUTES = ['/test/:attemptId', '/setup-plan/:attemptId', '/results/:attemptId']

/** Role-gated — a plain student account is expected to be bounced or shown an empty state. */
export const ROLE_ROUTES = ['/admin', '/tutor']

/**
 * Console messages that are noisy but not defects. Anything not matched here
 * fails the console-error assertions.
 */
export const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /\[vite\] connect(ing|ed)/i,
  /React Router Future Flag/i,
  /favicon/i,
]

export function isRealConsoleError(text) {
  return !IGNORED_CONSOLE.some((pattern) => pattern.test(text))
}

/** Attaches console/pageerror collectors. Call before navigating. */
export function collectErrors(page) {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error' && isRealConsoleError(msg.text())) errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(`Uncaught: ${err.message}`))
  return errors
}
