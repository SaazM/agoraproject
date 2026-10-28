// Renders a test's answer key as a standalone HTML page. Used by the admin-only
// /api/admin/answer-key route and by scripts/generateAnswerKeyPages.mjs.
// Answer keys must never be published under public/: anything there is served to
// every visitor, including students taking the test.
import { getAnswerKeyBySection } from '../../src/data/answerKeys.js'
import { getExamConfigForTest, getQuestionCountForTest } from '../../src/data/examData.js'

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function renderTable(map) {
  const keys = Object.keys(map || {}).map((k) => Number(k)).filter(Number.isFinite).sort((a, b) => a - b)
  return keys.map((q) => (
    `<tr><td class="q">${q}</td><td class="a">${escapeHtml(map[q])}</td></tr>`
  )).join('\n')
}

function buildSections(testId, key) {
  const cfg = getExamConfigForTest(testId)
  return (cfg.moduleOrder || []).map((id) => {
    const meta = cfg.modules?.[id] || {}
    return {
      id,
      label: `${meta.label || id} · ${meta.module || ''} (Q1–${Number(meta.questions || 0)})`.replace(' ·  (', ' ('),
      rows: renderTable(key?.[id] || {}),
    }
  })
}

function pageHtml({ testId, title, subtitle, pdfUrl, explanationUrl, appUrl, key }) {
  const sections = buildSections(testId, key)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; }
      header { position: sticky; top: 0; z-index: 10; background: white; border-bottom: 1px solid #e2e8f0; }
      .wrap { max-width: 1000px; margin: 0 auto; padding: 16px; }
      h1 { margin: 0; font-size: 18px; font-weight: 900; }
      .sub { margin-top: 4px; font-size: 13px; color: #64748b; }
      .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
      a.btn { display: inline-flex; align-items: center; justify-content: center; padding: 10px 12px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 13px; border: 1px solid #e2e8f0; background: #ffffff; color: #0f172a; }
      a.btn.primary { background: #0ea5e9; border-color: #0ea5e9; color: white; }
      main .wrap { padding-top: 18px; padding-bottom: 40px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
      .card { background: white; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px; }
      .title { font-size: 12px; font-weight: 900; letter-spacing: .6px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
      td.q { width: 48px; color: #64748b; font-weight: 800; }
      td.a { font-weight: 900; text-align: right; }
      .note { margin-top: 12px; font-size: 12px; color: #64748b; line-height: 1.5; }
      code { background: #f1f5f9; border: 1px solid #e2e8f0; padding: 0 6px; border-radius: 8px; }
    </style>
  </head>
  <body>
    <header>
      <div class="wrap">
        <h1>${escapeHtml(title)}</h1>
        <div class="sub">${escapeHtml(subtitle)}</div>
        <div class="actions">
          ${pdfUrl ? `<a class="btn primary" href="${escapeHtml(pdfUrl)}" target="_blank" rel="noreferrer">Open Test PDF →</a>` : ''}
          ${explanationUrl ? `<a class="btn" href="${escapeHtml(explanationUrl)}" target="_blank" rel="noreferrer">Open Explanations PDF →</a>` : ''}
          ${appUrl ? `<a class="btn" href="${escapeHtml(appUrl)}" target="_blank" rel="noreferrer">Open App →</a>` : ''}
        </div>
        <div class="note">
          Free-response answers may allow equivalent forms (ex: <code>.5</code> vs <code>1/2</code>, <code>pi</code> vs <code>π</code>).
        </div>
      </div>
    </header>
    <main>
      <div class="wrap">
        <div class="grid">
          ${sections.map((s) => {
            return `<div class="card">
              <div class="title">${escapeHtml(s.label)}</div>
              <table><tbody>${s.rows}</tbody></table>
            </div>`
          }).join('\n')}
        </div>
      </div>
    </main>
  </body>
</html>`
}

/** Returns the HTML page for a test from TESTS, or null when it has no built-in key. */
export function renderAnswerKeyPage(test, { appUrl = '' } = {}) {
  const key = getAnswerKeyBySection(test?.id)
  if (!key) return null
  const cfg = getExamConfigForTest(test.id)
  return pageHtml({
    testId: test.id,
    title: `${test.label} — Answer Key`,
    subtitle: `The Agora Project · ${cfg.moduleOrder.length} sections · ${getQuestionCountForTest(test.id)} questions`,
    pdfUrl: test.cbUrl || test.pdfUrl || '',
    explanationUrl: test.explanationUrl || '',
    appUrl,
    key,
  })
}
