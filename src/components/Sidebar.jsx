import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Icon from './AppIcons.jsx'

const navItems = {
  student: [
    { section: 'MAIN' },
    { icon: 'home', label: 'Dashboard', to: '/dashboard' },
    { icon: 'task', label: 'Tasks', to: '/tasks' },
    { icon: 'calendar', label: 'Journey', to: '/journey' },
    { section: 'STUDY' },
    { icon: 'guide', label: 'Study Guide', to: '/guide' },
    { icon: 'target', label: 'Test Strategies', to: '/strategies' },
    { icon: 'star', label: 'More Practice', to: '/practice' },
    { icon: 'test', label: 'Extra Tests', to: '/extra-tests' },
    { icon: 'mistakes', label: 'Mistakes', to: '/mistakes' },
    { icon: 'folder', label: 'Formula Sheet', to: '/formulas' },
    { section: 'PROGRESS' },
    { icon: 'report', label: 'Progress Report', to: '/report' },
    { icon: 'calendar', label: 'Calendar', to: '/calendar' },
    { icon: 'students', label: 'College Recruiting', to: '/college-recruiting' },
    { section: '' },
    { icon: 'info', label: 'About', to: '/about' },
    { icon: 'settings', label: 'Settings', to: '/settings' },
  ],
  tutor: [
    { section: 'MAIN' },
    { icon: 'home', label: 'Dashboard', to: '/tutor' },
    { section: '' },
    { icon: 'info', label: 'About', to: '/about' },
    { icon: 'settings', label: 'Settings', to: '/settings' },
  ],
  admin: [
    { section: 'MAIN' },
    { icon: 'admin', label: 'Admin Panel', to: '/admin' },
    { section: '' },
    { icon: 'info', label: 'About', to: '/about' },
    { icon: 'settings', label: 'Settings', to: '/settings' },
  ],
}

export default function Sidebar({ currentExam = 'sat' }) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const role = profile?.role || 'student'
  const items = navItems[role] || navItems.student
  const firstName = profile?.full_name?.split(' ')[0] || ''

  function isActive(to) {
    return location.pathname === to || location.pathname.startsWith(to + '/')
  }

  return (
    <>
    <aside className="sidebar">
      <div className="sidebar-top">
        <Link to="/dashboard" className="sidebar-brand">
          <img src="/logo.png" alt="" className="sidebar-logo" />
          <span className="sidebar-brand-text">The Agora Project</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {items.map((item, i) => {
          if ('section' in item) {
            if (!item.section) return <div key={`sep-${i}`} style={{ height: 12 }} />
            return (
              <div key={item.section} className="sidebar-section-label">
                {item.section}
              </div>
            )
          }

          const examParam = currentExam ? `?exam=${currentExam}` : ''
          const examPages = ['/dashboard', '/tasks', '/guide', '/strategies', '/practice', '/extra-tests', '/mistakes', '/formulas', '/report', '/calendar', '/journey', '/college-recruiting']
          const href = examPages.includes(item.to) ? `${item.to}${examParam}` : item.to
          const active = isActive(item.to)

          return (
            <Link
              key={item.to}
              to={href}
              className={`sidebar-link${active ? ' active' : ''}`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {firstName.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.full_name || 'User'}</div>
            <div className="sidebar-user-role">{role.charAt(0).toUpperCase() + role.slice(1)}</div>
          </div>
        </div>
        <button className="sidebar-signout" onClick={() => signOut()}>
          Sign Out
        </button>
      </div>
    </aside>

      {/* Mobile bottom nav — shown when sidebar is hidden */}
      <nav className="mobile-bottom-nav">
        {[
          { icon: 'home', label: 'Home', to: '/dashboard' },
          { icon: 'guide', label: 'Study', to: '/guide' },
          { icon: 'task', label: 'Tasks', to: '/tasks' },
          { icon: 'report', label: 'Report', to: '/report' },
          { icon: 'settings', label: 'More', to: '/settings' },
        ].map(item => {
          const examParam = currentExam ? `?exam=${currentExam}` : ''
          const href = ['/dashboard', '/guide', '/tasks', '/report'].includes(item.to) ? `${item.to}${examParam}` : item.to
          return (
            <Link key={item.to} to={href} className={isActive(item.to) ? 'active' : ''}>
              <Icon name={item.icon} size={22} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
