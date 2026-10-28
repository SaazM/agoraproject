// Writes every built-in answer key to standalone HTML files for offline admin use.
// Output goes to private/answer-keys/ (gitignored) or the directory given as the
// first argument. NEVER point this at public/: everything there is served to students.
// Admins view keys in the app through /api/admin/answer-key instead.
import fs from 'node:fs'
import path from 'node:path'

import { TESTS } from '../src/data/tests.js'
import { renderAnswerKeyPage } from '../api/lib/answerKeyPage.js'

const ROOT = path.resolve(process.cwd())
const OUT_DIR = path.resolve(process.argv[2] || path.join(ROOT, 'private', 'answer-keys'))

if (OUT_DIR === path.join(ROOT, 'public') || OUT_DIR.startsWith(path.join(ROOT, 'public') + path.sep)) {
  console.error('Refusing to write answer keys under public/: students could download them.')
  process.exit(1)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
for (const t of TESTS) {
  const html = renderAnswerKeyPage(t, { appUrl: '/login' })
  if (!html) throw new Error(`Missing built-in key for ${t.id}`)
  fs.writeFileSync(path.join(OUT_DIR, `${t.id}.html`), html)
}
console.log('Wrote answer key pages to:', OUT_DIR)
