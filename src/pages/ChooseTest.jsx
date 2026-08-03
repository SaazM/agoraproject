import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { saveLocalPreferredExam } from '../lib/examChoice.js'

// The platform is SAT-only: record the preference (fire-and-forget) and
// continue straight to onboarding via a render-time redirect.
export default function ChooseTest() {
  const { user, profile, setPreferredExam } = useAuth()

  const isTutor = profile?.role === 'tutor'
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (isTutor || isAdmin) return
    try { saveLocalPreferredExam(user?.id, 'sat') } catch {}
    setPreferredExam('sat').catch(() => {})
  }, [isTutor, isAdmin, user?.id, setPreferredExam])

  if (isTutor) return <Navigate to="/tutor" replace />
  if (isAdmin) return <Navigate to="/admin" replace />
  return <Navigate to="/welcome?exam=sat" replace />
}
