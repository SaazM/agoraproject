import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import PasswordInput from './PasswordInput.jsx'
import ProgramSelect from './ProgramSelect.jsx'
import { usePrograms } from '../hooks/usePrograms.js'

export default function UserMenu({ profile }) {
  const [open, setOpen] = useState(false)
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwStatus, setPwStatus] = useState({ kind: '', msg: '' })
  const [affiliation, setAffiliation] = useState('')
  const [affSaving, setAffSaving] = useState(false)
  const [affStatus, setAffStatus] = useState({ kind: '', msg: '' })
  const wrapRef = useRef(null)
  const programList = usePrograms()
  // Tutors/admins can't move themselves between programs (that's what scopes their access).
  const programLocked = profile?.role === 'tutor' || profile?.role === 'admin'

  useEffect(() => {
    if (profile?.affiliation != null) setAffiliation(profile.affiliation || '')
  }, [profile?.affiliation])

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  async function updatePassword() {
    setPwStatus({ kind: '', msg: '' })
    const next = String(pw1 || '')
    if (next.length < 8) return setPwStatus({ kind: 'err', msg: 'Password must be at least 8 characters.' })
    if (next !== pw2) return setPwStatus({ kind: 'err', msg: 'Passwords do not match.' })
    if (!supabase) return setPwStatus({ kind: 'err', msg: 'Supabase is not configured.' })
    const { error } = await supabase.auth.updateUser({ password: next })
    if (error) return setPwStatus({ kind: 'err', msg: error.message })
    setPw1(''); setPw2('')
    setPwStatus({ kind: 'ok', msg: 'Password updated.' })
  }

  async function updateAffiliation() {
    setAffStatus({ kind: '', msg: '' })
    if (!supabase || !profile?.id) return setAffStatus({ kind: 'err', msg: 'Not signed in.' })
    const clean = String(affiliation || '').replace(/[<>]/g, '').trim().slice(0, 100)
    setAffSaving(true)
    try {
      // Update auth metadata so it persists for future profile syncs
      await supabase.auth.updateUser({ data: { affiliation: clean } })
      // Try to update the profiles table directly
      const { error } = await supabase
        .from('profiles')
        .update({ affiliation: clean || null })
        .eq('id', profile.id)
      if (error) throw error
      setAffStatus({ kind: 'ok', msg: 'Program updated.' })
    } catch (e) {
      setAffStatus({ kind: 'err', msg: e?.message || 'Could not update program.' })
    } finally {
      setAffSaving(false)
    }
  }

  const label = profile?.email || 'Account'

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="btn btn-outline"
        style={{
          padding: '6px 12px',
          fontSize: 12,
          color: 'rgba(255,255,255,.85)',
          borderColor: 'rgba(255,255,255,.2)',
          background: 'rgba(255,255,255,.08)',
          maxWidth: 240,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
        title="Account settings"
      >
        {label} ▾
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 10px)',
          width: 340,
          background: 'white',
          border: '1px solid #e4e0d5',
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(22,24,29,.06)',
          padding: 16,
          zIndex: 50,
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
        }}>
          {/* Account info */}
          <div style={{ fontWeight: 600, fontSize: 14, color: '#16181d', marginBottom: 6 }}>Account</div>
          <div style={{ fontSize: 12, color: '#565a63', marginBottom: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Signed in as <span style={{ fontWeight: 600, color: '#16181d' }}>{profile?.email || '—'}</span>
          </div>

          {/* Program */}
          <div style={{ borderTop: '1px solid #f3f0e9', paddingTop: 12, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#16181d', marginBottom: 8 }}>Program</div>
            {programLocked ? (
              <div style={{ fontSize: 13, color: '#565a63' }}>
                {profile?.affiliation || (profile?.role === 'admin' ? 'All programs (admin)' : 'No program assigned yet')}
              </div>
            ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <ProgramSelect
                value={affiliation}
                onChange={(v) => { setAffiliation(v); setAffStatus({ kind: '', msg: '' }) }}
                programs={programList.programs}
                loading={programList.loading}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '8px 10px',
                  fontSize: 13,
                  border: '1.5px solid #e4e0d5',
                  borderRadius: 8,
                  outline: 'none',
                  color: '#16181d',
                  background: '#f7f5ef',
                }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateAffiliation}
                disabled={affSaving}
                style={{ padding: '8px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
              >
                {affSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
            )}
            {affStatus.msg && (
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: affStatus.kind === 'ok' ? '#10b981' : '#ef4444' }}>
                {affStatus.msg}
              </div>
            )}
          </div>

          {/* Change password */}
          <div style={{ borderTop: '1px solid #f3f0e9', paddingTop: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#16181d', marginBottom: 8 }}>Change Password</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <PasswordInput
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                placeholder="New password (min 8)"
                minLength={8}
                autoComplete="new-password"
              />
              <PasswordInput
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                placeholder="Confirm new password"
                minLength={8}
                autoComplete="new-password"
              />
              <button className="btn btn-primary" type="button" onClick={updatePassword} style={{ width: '100%' }}>
                Update Password
              </button>
              {pwStatus.msg && (
                <div style={{ fontSize: 11, fontWeight: 700, color: pwStatus.kind === 'ok' ? '#10b981' : '#ef4444' }}>
                  {pwStatus.kind === 'ok' ? 'Success: ' : 'Error: '}{pwStatus.msg}
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: '#8a8f98', marginTop: 10, lineHeight: 1.5 }}>
              If you see a "reauthenticate" error, sign out and sign back in, then try again.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
