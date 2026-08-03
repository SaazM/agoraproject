import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { supabase } from '../lib/supabase.js'
import Sidebar from '../components/Sidebar.jsx'
import Icon from '../components/AppIcons.jsx'
import { useToast } from '../components/Toast.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }
const scaleIn = { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 } }

const card = {
  background: '#fff',
  border: '1px solid rgba(2,132,199,.1)',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(22,24,29,.06)',
  padding: '36px 32px',
  marginBottom: 28,
}

const sectionTitle = {
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: 22,
  fontWeight: 600,
  color: '#16181d',
  marginBottom: 8,
}

const labelStyle = {
  display: 'block',
  fontFamily: 'Fraunces, Georgia, serif',
  fontSize: 13,
  fontWeight: 600,
  color: '#3f434b',
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  border: '1px solid #e4e0d5',
  borderRadius: 10,
  outline: 'none',
  transition: 'border-color .2s',
  fontFamily: 'inherit',
  color: '#16181d',
  boxSizing: 'border-box',
}

const btnPrimary = {
  padding: '10px 24px',
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'Fraunces, Georgia, serif',
  color: '#fff',
  background: '#0284c7',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
  transition: 'opacity .2s',
}

function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('')
}

export default function Settings() {
  const { user, profile } = useAuth()
  const addToast = useToast()
  const fileInputRef = useRef(null)

  const exam = profile?.preferred_exam || user?.user_metadata?.preferred_exam || 'sat'

  // --- Profile picture state ---
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // --- Password state ---
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // --- Affiliation state ---
  const [affiliation, setAffiliation] = useState('')
  const [savingAffiliation, setSavingAffiliation] = useState(false)

  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatar_url || null)
      setAffiliation(profile.affiliation || '')
    }
  }, [profile])

  // --- Avatar upload ---
  async function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    // Reset file input so re-selecting the same file triggers onChange again
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (!file) return

    setUploadingAvatar(true)
    try {
      const ALLOWED_EXTS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
      const ext = ALLOWED_EXTS[file.type]
      if (!ext) throw new Error('Only JPG, PNG, and WebP images are allowed')
      if (file.size > 2 * 1024 * 1024) throw new Error('Image must be under 2 MB')

      // Show local preview immediately
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      const filePath = `avatars/${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const publicUrl = urlData?.publicUrl
      if (!publicUrl) throw new Error('Could not get public URL')

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      setAvatarPreview(null)
      addToast('Profile picture updated!', 'success')
    } catch (err) {
      console.error('Avatar upload error:', err)
      addToast(err.message || 'Failed to upload picture', 'error')
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  // --- Change password ---
  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordError('')

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      addToast('Password updated successfully!', 'success')
    } catch (err) {
      console.error('Password change error:', err)
      addToast(err.message || 'Failed to update password', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  // --- Affiliation ---
  async function handleSaveAffiliation(e) {
    e.preventDefault()
    setSavingAffiliation(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ affiliation: affiliation.trim() })
        .eq('id', user.id)

      if (error) throw error
      addToast('School / affiliation updated!', 'success')
    } catch (err) {
      console.error('Affiliation update error:', err)
      addToast(err.message || 'Failed to update affiliation', 'error')
    } finally {
      setSavingAffiliation(false)
    }
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || ''
  const displayImage = avatarPreview || avatarUrl

  return (
    <div className="app-layout has-sidebar">
      <Sidebar currentExam={exam} />
      <motion.div
        className="page fade-up"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        {/* ---------- header ---------- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ textAlign: 'center', padding: '48px 24px 32px' }}
        >
          <motion.div
            {...scaleIn}
            transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              margin: '0 auto 20px',
            }}
          >
            <Icon name="settings" size={28} />
          </motion.div>
          <h1
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 36,
              fontWeight: 600,
              color: '#16181d',
              margin: '0 0 8px',
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: 17, color: '#565a63', fontWeight: 500, margin: 0 }}>
            Manage your profile and account preferences
          </p>
        </motion.div>

        <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 20px 60px' }}>
          {/* ---------- profile picture ---------- */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={card}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Icon name="students" size={18} />
              </div>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Profile Picture</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {/* Avatar circle */}
              <motion.div
                {...scaleIn}
                transition={{ duration: 0.45, delay: 0.2, ease: 'easeOut' }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: displayImage
                    ? `url(${displayImage}) center/cover no-repeat`
                    : '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '3px solid rgba(2,132,199,.15)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {!displayImage && (
                  <span
                    style={{
                      fontFamily: 'Fraunces, Georgia, serif',
                      fontSize: 32,
                      fontWeight: 600,
                      color: '#fff',
                      userSelect: 'none',
                    }}
                  >
                    {getInitials(displayName)}
                  </span>
                )}
                {uploadingAvatar && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        border: '3px solid rgba(255,255,255,.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                  </div>
                )}
              </motion.div>

              <div>
                <p style={{ fontSize: 14, color: '#3f434b', margin: '0 0 12px', lineHeight: 1.5 }}>
                  Upload a photo to personalize your profile. JPG, PNG, or WebP up to 2 MB.
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{
                    ...btnPrimary,
                    padding: '8px 18px',
                    fontSize: 13,
                    opacity: uploadingAvatar ? 0.6 : 1,
                  }}
                >
                  {uploadingAvatar ? 'Uploading...' : 'Choose Image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </motion.div>

          {/* ---------- change password ---------- */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={card}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Icon name="settings" size={18} />
              </div>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setPasswordError('')
                  }}
                  placeholder="Enter new password"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
                  onBlur={(e) => (e.target.style.borderColor = '#e4e0d5')}
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setPasswordError('')
                  }}
                  placeholder="Confirm new password"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
                  onBlur={(e) => (e.target.style.borderColor = '#e4e0d5')}
                />
              </div>

              <AnimatePresence>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ fontSize: 13, color: '#ef4444', margin: 0, fontWeight: 500 }}
                  >
                    {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>

              <div>
                <button
                  type="submit"
                  disabled={savingPassword || !newPassword || !confirmPassword}
                  style={{
                    ...btnPrimary,
                    opacity: savingPassword || !newPassword || !confirmPassword ? 0.55 : 1,
                  }}
                >
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* ---------- school / affiliation ---------- */}
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={card}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Icon name="info" size={18} />
              </div>
              <h2 style={{ ...sectionTitle, marginBottom: 0 }}>School / Affiliation</h2>
            </div>

            <form onSubmit={handleSaveAffiliation} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>School or Organization</label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="e.g. Lincoln High School"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#0284c7')}
                  onBlur={(e) => (e.target.style.borderColor = '#e4e0d5')}
                />
                <p style={{ fontSize: 12, color: '#8a8f98', margin: '6px 0 0', lineHeight: 1.5 }}>
                  This is used to connect you with your tutor or study group.
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={savingAffiliation}
                  style={{
                    ...btnPrimary,
                    opacity: savingAffiliation ? 0.55 : 1,
                  }}
                >
                  {savingAffiliation ? 'Saving...' : 'Save Affiliation'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Spinner keyframe for avatar upload */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </div>
  )
}
