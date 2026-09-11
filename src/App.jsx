import React, { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import { ToastProvider } from './components/Toast.jsx'
import Login from './pages/Login.jsx'

const loadDashboard = () => import('./pages/Dashboard.jsx')
const loadTestTaking = () => import('./pages/TestTaking.jsx')
const loadResults = () => import('./pages/Results.jsx')
const loadAdmin = () => import('./pages/Admin.jsx')
const loadGuide = () => import('./pages/Guide.jsx')
const loadFinalTest = () => import('./pages/FinalTest.jsx')
const loadMistakes = () => import('./pages/Mistakes.jsx')
const loadReport = () => import('./pages/Report.jsx')
const loadCalendar = () => import('./pages/Calendar.jsx')
const loadShare = () => import('./pages/Share.jsx')
const loadAuthCallback = () => import('./pages/AuthCallback.jsx')
const loadResetPassword = () => import('./pages/ResetPassword.jsx')
const loadChooseTest = () => import('./pages/ChooseTest.jsx')
const loadSetupPlan = () => import('./pages/SetupPlan.jsx')
const loadTutorDashboard = () => import('./pages/TutorDashboard.jsx')
const loadOverview = () => import('./pages/Overview.jsx')
const loadWelcome = () => import('./pages/Welcome.jsx')
const loadAbout = () => import('./pages/About.jsx')
const loadMorePractice = () => import('./pages/MorePractice.jsx')
const loadTasks = () => import('./pages/Tasks.jsx')
const loadJourney = () => import('./pages/Journey.jsx')
const loadSettings = () => import('./pages/Settings.jsx')
const loadExtraTests = () => import('./pages/ExtraTests.jsx')
const loadPickTestDate = () => import('./pages/PickTestDate.jsx')
const loadTestStrategies = () => import('./pages/TestStrategies.jsx')
const loadPriorScore = () => import('./pages/PriorScore.jsx')
const loadCollegeRecruiting = () => import('./pages/CollegeRecruiting.jsx')
const loadFormulaSheet = () => import('./pages/FormulaSheet.jsx')
const loadLanding = () => import('./pages/Landing.jsx')

const Dashboard = lazy(loadDashboard)
const TestTaking = lazy(loadTestTaking)
const Results = lazy(loadResults)
const Admin = lazy(loadAdmin)
const Guide = lazy(loadGuide)
const FinalTest = lazy(loadFinalTest)
const Mistakes = lazy(loadMistakes)
const Report = lazy(loadReport)
const Calendar = lazy(loadCalendar)
const Share = lazy(loadShare)
const AuthCallback = lazy(loadAuthCallback)
const ResetPassword = lazy(loadResetPassword)
const ChooseTest = lazy(loadChooseTest)
const SetupPlan = lazy(loadSetupPlan)
const TutorDashboard = lazy(loadTutorDashboard)
const Overview = lazy(loadOverview)
const Welcome = lazy(loadWelcome)
const About = lazy(loadAbout)
const MorePractice = lazy(loadMorePractice)
const Tasks = lazy(loadTasks)
const Journey = lazy(loadJourney)
const Settings = lazy(loadSettings)
const ExtraTests = lazy(loadExtraTests)
const PickTestDate = lazy(loadPickTestDate)
const TestStrategies = lazy(loadTestStrategies)
const PriorScore = lazy(loadPriorScore)
const CollegeRecruiting = lazy(loadCollegeRecruiting)
const FormulaSheet = lazy(loadFormulaSheet)
const Landing = lazy(loadLanding)

function RouteLoader() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Fraunces,Georgia,serif',color:'#565a63'}}>
      Loading…
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Fraunces,Georgia,serif',color:'#565a63'}}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function MissingProfileNotice() {
  const { signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)
  const sql = `insert into public.profiles (id, email, full_name, role, affiliation)
select u.id, u.email,
  coalesce(u.raw_user_meta_data->>'full_name', ''),
  'student',
  nullif(trim(coalesce(u.raw_user_meta_data->>'affiliation', '')), '')
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);`
  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Fraunces,Georgia,serif', background: '#faf9f6', padding: 24 }}>
      <div style={{ maxWidth: 560, background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24, boxShadow: '0 2px 16px rgba(15,31,61,.09)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0f1f3d', marginBottom: 10 }}>Account setup incomplete</div>
        <div style={{ color: '#475569', fontSize: 14, lineHeight: 1.65, marginBottom: 14 }}>
          You’re signed in, but there is no row in <code style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>public.profiles</code>. Common causes: signing up before running{' '}
          <code style={{ fontSize: 12, background: '#f1f5f9', padding: '2px 6px', borderRadius: 4 }}>supabase-schema.sql</code>, or the new-user trigger not installed yet.
        </div>
        <div style={{ color: '#334155', fontSize: 13, lineHeight: 1.6, marginBottom: 14, padding: '12px 14px', background: '#f1f5f9', borderRadius: 10 }}>
          <strong>Deleted the user in Supabase?</strong> This browser can still be holding an old session. Use <strong>Sign out</strong> below (or clear site data for localhost) — then sign up again.
        </div>
        <div style={{ color: '#0f1f3d', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
          <strong>Otherwise fix:</strong> Supabase → <strong>SQL Editor</strong> → paste and run:
        </div>
        <pre style={{ background: '#0b1220', color: '#e2e8f0', padding: 14, borderRadius: 10, overflowX: 'auto', fontSize: 11, lineHeight: 1.5, margin: '0 0 14px' }}>{sql}</pre>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              fontFamily: 'Fraunces,Georgia,serif',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              cursor: signingOut ? 'wait' : 'pointer',
              background: '#0f1f3d',
              color: 'white',
            }}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
          <span style={{ fontSize: 12, color: '#565a63' }}>Then refresh if needed and sign in again.</span>
        </div>
      </div>
    </div>
  )
}

function PublicRoute({ children }) {
  const { user, profile, profileReady, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Fraunces,Georgia,serif',color:'#565a63'}}>Loading…</div>
  if (user) {
    // Wait for profile fetch to finish before redirecting (avoid infinite spinner when profile row is missing)
    if (!profileReady) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Fraunces,Georgia,serif',color:'#565a63'}}>Loading…</div>
    if (!profile) return <MissingProfileNotice />
    const role = profile?.role
    if (role === 'tutor') return <Navigate to="/tutor" replace />
    if (role === 'admin') return <Navigate to="/admin" replace />
    // New students who haven't chosen an exam go to choose-test
    const hasChosenExam = user?.user_metadata?.preferred_exam
    if (!hasChosenExam) return <Navigate to="/choose-test" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

function RoleRedirect() {
  const { profile, profileReady } = useAuth()
  if (!profileReady) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Fraunces,Georgia,serif',color:'#565a63'}}>Loading…</div>
  if (!profile) return <MissingProfileNotice />
  const role = profile?.role
  if (role === 'tutor') return <Navigate to="/tutor" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/dashboard" replace />
}

function AppWarmup() {
  const { user } = useAuth()

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const preload = () => {
      const loaders = user
        ? [loadDashboard, loadGuide, loadMistakes, loadResults, loadReport, loadCalendar, loadChooseTest, loadOverview]
        : [loadDashboard]
      loaders.forEach((load) => {
        try { load().catch(() => {}) } catch {}
      })
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preload, { timeout: 1200 })
      return () => window.cancelIdleCallback(idleId)
    }

    const timeoutId = window.setTimeout(preload, 250)
    return () => window.clearTimeout(timeoutId)
  }, [user])

  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div style={{ minHeight: '100vh' }}>
        <Routes location={location}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset" element={<ResetPassword />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/choose-test" element={<ProtectedRoute><ChooseTest /></ProtectedRoute>} />
              <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
              <Route path="/pick-test-date" element={<ProtectedRoute><PickTestDate /></ProtectedRoute>} />
              <Route path="/prior-score" element={<ProtectedRoute><PriorScore /></ProtectedRoute>} />
              <Route path="/test/:attemptId" element={<ProtectedRoute><TestTaking /></ProtectedRoute>} />
              <Route path="/setup-plan/:attemptId" element={<ProtectedRoute><SetupPlan /></ProtectedRoute>} />
              <Route path="/results/:attemptId" element={<ProtectedRoute><Results /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/tutor" element={<ProtectedRoute><TutorDashboard /></ProtectedRoute>} />
              <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
              <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
              <Route path="/strategies" element={<ProtectedRoute><TestStrategies /></ProtectedRoute>} />
              <Route path="/final" element={<ProtectedRoute><FinalTest /></ProtectedRoute>} />
              <Route path="/mistakes" element={<ProtectedRoute><Mistakes /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/practice" element={<ProtectedRoute><MorePractice /></ProtectedRoute>} />
              <Route path="/extra-tests" element={<ProtectedRoute><ExtraTests /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/journey" element={<ProtectedRoute><Journey /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/college-recruiting" element={<ProtectedRoute><CollegeRecruiting /></ProtectedRoute>} />
              <Route path="/formulas" element={<ProtectedRoute><FormulaSheet /></ProtectedRoute>} />
              <Route path="/share" element={<Share />} />
              <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppErrorBoundary>
            <AppWarmup />
            <ScrollToTop />
            <Suspense fallback={<RouteLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </AppErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
      <Analytics />
      <SpeedInsights />
    </AuthProvider>
  )
}
