import { isValidUUID, isValidExam } from './validate.js'

export function isAgoraAdmin(profile) {
  return profile?.role === 'admin'
}

export function isTutorRole(profile) {
  return profile?.role === 'tutor'
}

export function resolveViewContext({ userId, profile, search = '', studentIds }) {
  const params = new URLSearchParams(search || '')
  const raw = String(params.get('user') || '').trim()
  // Only accept valid UUIDs for the user parameter
  const requestedUserId = isValidUUID(raw) ? raw : ''
  const isAdmin = isAgoraAdmin(profile)
  const isTutor = isTutorRole(profile)
  // Tutors can only preview students they have access to (if studentIds list provided)
  const tutorAllowed = isTutor && requestedUserId && (!studentIds || studentIds.includes(requestedUserId))
  const canPreview = Boolean((isAdmin || tutorAllowed) && requestedUserId)
  const viewUserId = canPreview ? requestedUserId : (userId || '')
  const isAdminPreview = Boolean(canPreview && String(requestedUserId) !== String(userId || ''))
  return { requestedUserId, viewUserId, isAdminPreview, isAdmin, isTutor }
}

export function withViewUser(path, viewUserId, isAdminPreview) {
  if (!path || !viewUserId || !isAdminPreview) return path
  if (!isValidUUID(viewUserId)) return path
  return withQueryParam(path, 'user', viewUserId)
}

export function withQueryParam(path, key, value) {
  if (!path || !key || value == null || value === '') return path
  const [pathname, hash = ''] = String(path).split('#')
  const [base, query = ''] = pathname.split('?')
  const params = new URLSearchParams(query)
  params.set(key, String(value).slice(0, 200))
  const next = `${base}?${params.toString()}`
  return hash ? `${next}#${hash}` : next
}

export function withExam(path, exam) {
  if (!isValidExam(exam)) return path
  return withQueryParam(path, 'exam', exam)
}
