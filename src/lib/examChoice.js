// The platform is SAT-only. These helpers are kept for compatibility with
// existing callers and stored user metadata, but always resolve to 'sat'.
export function normalizeExam(value, fallback = 'sat') {
  return 'sat'
}

export function loadLocalPreferredExam() {
  return 'sat'
}

export function saveLocalPreferredExam() {}

export function getUserPreferredExam() {
  return 'sat'
}

export function getInitialPreferredExam() {
  return 'sat'
}

export function bestAccuracyByExam() {
  return { sat: 0 }
}

export function chooseDashboardExam() {
  return 'sat'
}

export function userNeedsExamChoice() {
  return false
}
