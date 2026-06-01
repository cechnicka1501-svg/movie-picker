import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

function getAvatarColor(str) {
  const colors = ['#3D2B4A', '#2B3D4A', '#C4614A', '#2D1F2D', '#4A3D2B']
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(displayName, email) {
  const name = displayName || email || '?'
  const parts = name.split(/[\s@._]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name[0].toUpperCase()
}

export function EditProfileScreen({ user, onBack }) {
  const metadata = user?.user_metadata || {}
  const email = user?.email || ''

  const [displayName, setDisplayName] = useState(metadata.display_name || '')
  const [username, setUsername] = useState(metadata.username || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const avatarColor = getAvatarColor(email || displayName)
  const initials = getInitials(
    displayName || metadata.display_name,
    email
  )

  async function handleSave() {
    setLoading(true)
    setError(null)
    const { error: err } = await supabase.auth.updateUser({
      data: {
        display_name: displayName.trim(),
        username: username.trim().replace(/^@/, ''),
      },
    })
    setLoading(false)
    if (err) setError(err.message)
    else onBack()
  }

  return (
    <div className="edit-profile-screen">
      {/* Header */}
      <div className="edit-profile-header">
        <button type="button" className="back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <h1 className="edit-profile-title">Edit Profile</h1>
        <div style={{ width: 56 }} />
      </div>

      <div className="edit-profile-body">
        {/* Avatar */}
        <div className="edit-profile-avatar-wrap">
          <div className="profile-avatar profile-avatar--lg" style={{ backgroundColor: avatarColor }}>
            <span className="profile-avatar__initials">{initials}</span>
          </div>
          <button type="button" className="text-action" disabled>
            Change photo
          </button>
        </div>

        {/* Form */}
        <div className="card edit-profile-form">
          <div className="edit-profile-field">
            <label className="edit-profile-label">Display name</label>
            <input
              type="text"
              className="auth-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div className="edit-profile-field">
            <label className="edit-profile-label">Username</label>
            <div className="edit-profile-username-row">
              <span className="edit-profile-at">@</span>
              <input
                type="text"
                className="auth-input edit-profile-username-input"
                value={username.replace(/^@/, '')}
                onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                placeholder="username"
                autoComplete="username"
              />
            </div>
          </div>
        </div>

        {error && <p className="fetch-error">{error}</p>}

        <button
          type="button"
          className={`btn btn--primary${loading ? ' btn--loading' : ''}`}
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : 'Save'}
        </button>
      </div>
    </div>
  )
}
