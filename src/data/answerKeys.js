import { ANSWER_KEY } from './testData.js'
import { EXTRA_ANSWER_KEYS } from './extraAnswerKeys.js'
import { FINAL_ANSWER_KEY } from './finalAnswerKey.js'
import { normalizeTestId } from './tests.js'

export function getAnswerKeyBySection(testId) {
  const id = normalizeTestId(testId)
  if (!id) return ANSWER_KEY
  if (id === 'pre_test') return ANSWER_KEY
  if (id === 'final_test') return FINAL_ANSWER_KEY
  if (EXTRA_ANSWER_KEYS?.[id]) return EXTRA_ANSWER_KEYS[id]
  // For tests like `final_test`, the key can be parsed at runtime and cached in localStorage.
  try {
    const raw = localStorage.getItem('agora_answer_keys_cache_v1')
    const obj = raw ? JSON.parse(raw) : {}
    return obj?.[id] || null
  } catch {
    return null
  }
}
