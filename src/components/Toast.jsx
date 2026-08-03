import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import Icon from './AppIcons.jsx'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Set())

  useEffect(() => {
    const timers = timersRef.current
    return () => { for (const t of timers) clearTimeout(t) }
  }, [])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    const timer = setTimeout(() => {
      timersRef.current.delete(timer)
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
    timersRef.current.add(timer)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'grid', gap: 10, pointerEvents: 'none' }}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      onClick={onDismiss}
      style={{
        pointerEvents: 'auto',
        padding: '12px 18px',
        borderRadius: 12,
        background: toast.type === 'success'
          ? '#10b981'
          : '#16181d',
        color: 'white',
        fontFamily: 'Fraunces, Georgia, serif',
        fontSize: 13,
        fontWeight: 700,
        boxShadow: '0 1px 3px rgba(22,24,29,.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        transform: visible ? 'translateY(0)' : 'translateY(-120%)',
        opacity: visible ? 1 : 0,
        transition: 'all .35s cubic-bezier(.22,1,.36,1)',
        maxWidth: 340,
      }}
    >
      <span style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,.2)',
        flexShrink: 0,
      }}>
        <Icon name={toast.type === 'success' ? 'check' : 'info'} size={16} />
      </span>
      {toast.message}
    </div>
  )
}
