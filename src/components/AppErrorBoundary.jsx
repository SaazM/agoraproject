import React from 'react'

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: String(error?.message || error || 'Something went wrong'),
    }
  }

  componentDidCatch(error) {
    try {
      window.__agoraLastError = String(error?.message || error || 'Something went wrong')
    } catch {}
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 760, width: '100%', background: 'rgba(255,255,255,.94)', border: '1px solid rgba(22,24,29,.10)', borderRadius: 12, padding: 22, boxShadow: '0 1px 3px rgba(22,24,29,.06)' }}>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 600, color: '#16181d', marginBottom: 8 }}>
            We hit an app error
          </div>
          <div style={{ color: '#3f434b', fontSize: 14, lineHeight: 1.65, marginBottom: 14 }}>
            The page ran into a problem, but your account and data are still safe. Try reloading first. If your browser cached an older version, use the cache reset button.
          </div>
          <div style={{ fontFamily: 'ui-monospace, Menlo, Monaco, Consolas, monospace', fontSize: 12, color: '#565a63', background: 'rgba(22,24,29,.04)', border: '1px solid rgba(22,24,29,.08)', borderRadius: 12, padding: 12, marginBottom: 14, overflow: 'auto' }}>
            {this.state.message}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                if (window.agoraFixAndReload) window.agoraFixAndReload()
                else window.location.reload()
              }}
            >
              Fix Cache + Reload
            </button>
            <button className="btn btn-outline" onClick={() => { window.location.href = '/login' }}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }
}
