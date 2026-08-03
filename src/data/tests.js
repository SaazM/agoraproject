// Official College Board practice tests. We link out to the College Board PDF
// (students take the test in a separate tab) and collect answers on our site.
export const SAT_TESTS = [
  {
    id: 'pre_test',
    exam: 'sat',
    label: 'Pre Test',
    cbNumber: 11,
    cbLabel: 'SAT Practice Test #11',
    cbUrl: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-11-digital.pdf',
    akUrl: '/answer-keys/pre_test.html',
    kind: 'official',
  },
  {
    id: 'final_test',
    exam: 'sat',
    label: 'Final Test',
    cbNumber: 4,
    cbLabel: 'SAT Practice Test #4',
    cbUrl: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-4-digital.pdf',
    akUrl: '/answer-keys/final_test.html',
    kind: 'final',
  },
  { id: 'sat1', exam: 'sat', label: 'Skill Builder Test 1', cbNumber: 5, cbLabel: 'SAT Practice Test #5', cbUrl: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-5-digital.pdf', akUrl: '/answer-keys/sat1.html', kind: 'extra' },
  { id: 'sat2', exam: 'sat', label: 'Skill Builder Test 2', cbNumber: 6, cbLabel: 'SAT Practice Test #6', cbUrl: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-6-digital.pdf', akUrl: '/answer-keys/sat2.html', kind: 'extra' },
  { id: 'sat3', exam: 'sat', label: 'Skill Builder Test 3', cbNumber: 7, cbLabel: 'SAT Practice Test #7', cbUrl: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-7-digital.pdf', akUrl: '/answer-keys/sat3.html', kind: 'extra' },
  { id: 'sat4', exam: 'sat', label: 'Skill Builder Test 4', cbNumber: 8, cbLabel: 'SAT Practice Test #8', cbUrl: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-8-digital.pdf', akUrl: '/answer-keys/sat4.html', kind: 'extra' },
  { id: 'sat5', exam: 'sat', label: 'Skill Builder Test 5', cbNumber: 10, cbLabel: 'SAT Practice Test #10', cbUrl: 'https://satsuite.collegeboard.org/media/pdf/sat-practice-test-10-digital.pdf', akUrl: '/answer-keys/sat5.html', kind: 'extra' },
]

export const TESTS = SAT_TESTS

export function normalizeTestId(id) {
  const raw = String(id || '')
  if (!raw || raw === 'practice_test_11') return 'pre_test'
  return raw
}

export function getExamFromTestId() {
  return 'sat'
}

export function getTestsForExam() {
  return TESTS
}

export function getTestConfig(testId) {
  const id = normalizeTestId(testId)
  if (!id) return null
  return TESTS.find(t => t.id === id) || null
}
