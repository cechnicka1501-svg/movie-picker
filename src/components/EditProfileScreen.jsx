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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)

    try {
      // 1. Delete all user data from watch_queue
      await supabase
        .from('watch_queue')
        .delete()
        .eq('user_id', user.id)

      // 2. Delete the auth account via a SECURITY DEFINER PostgreSQL function.
      //    (supabase.auth.admin.deleteUser requires service-role key — not safe client-side)
      //    Run the SQL below in Supabase dashboard once to enable this:
      //
      //    CREATE OR REPLACE FUNCTION public.delete_user()
      //    RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
      //    BEGIN DELETE FROM auth.users WHERE id = auth.uid(); END; $$;
      //
      //    GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
      const { error: rpcError } = await supabase.rpc('delete_user')
      if (rpcError) throw rpcError

      // 3. Sign out (triggers AuthProvider → app returns to auth screen)
      await supabase.auth.signOut()
    } catch (err) {
      setDeleteError(
        err?.message?.includes('delete_user')
          ? 'Funkcja usuwania konta nie jest skonfigurowana. Skontaktuj się z administratorem.'
          : (err?.message || 'Nie udało się usunąć konta. Spróbuj ponownie.')
      )
      setDeleting(false)
    }
  }

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
    <div className="screen edit-profile-screen">
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

        <button
          type="button"
          className="delete-account-btn"
          onClick={() => { setDeleteError(null); setShowDeleteConfirm(true) }}
          disabled={loading}
        >
          Usuń konto
        </button>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h2 className="confirm-dialog__title">Usuń konto</h2>
            <p className="confirm-dialog__message">
              Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna.
            </p>
            {deleteError && <p className="confirm-dialog__error">{deleteError}</p>}
            <div className="confirm-dialog__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Anuluj
              </button>
              <button
                type="button"
                className={`btn btn--destructive${deleting ? ' btn--loading' : ''}`}
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? <span className="spinner" /> : 'Usuń konto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
