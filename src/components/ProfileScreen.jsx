import { useMemo } from 'react'

const POSTER_COLORS = [
  '#3D2B4A', '#2B3D4A', '#4A3D2B', '#2B4A3D', '#4A2B3D',
  '#3D4A2B', '#2B2B4A', '#4A4A2B', '#2B4A4A', '#4A2B2B',
]

const AVATAR_COLORS = ['#3D2B4A', '#2B3D4A', '#C4614A', '#2D1F2D', '#4A3D2B']

function getPosterColor(id) {
  return POSTER_COLORS[id % POSTER_COLORS.length]
}

function getAvatarColor(str) {
  let hash = 0
  for (let i = 0; i < (str || '').length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(displayName, email) {
  const name = displayName || email || '?'
  const parts = name.split(/[\s@._]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name[0].toUpperCase()
}

export function ProfileScreen({ user, queue, watchedHistory = [], onEdit, onGoToExplore, onGoToQueue, onGoToHome }) {
  const metadata = user?.user_metadata || {}
  const displayName = metadata.display_name || user?.email?.split('@')[0] || 'User'
  const username = metadata.username || null
  const email = user?.email || ''

  const saved = queue.length
  const watched = watchedHistory.length
  const recentlyWatched = useMemo(
    () => watchedHistory.slice(0, 12),
    [watchedHistory]
  )

  const avatarColor = getAvatarColor(email || displayName)
  const initials = getInitials(metadata.display_name, email)

  return (
    <div className="profile-screen">
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-header__title">My Profile</h1>
        <div className="header-icons">
          <button type="button" className="icon-btn" aria-label="Share">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button type="button" className="icon-btn" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="profile-body">
        {/* Identity */}
        <div className="card profile-identity">
          <div className="profile-avatar" style={{ backgroundColor: avatarColor }}>
            <span className="profile-avatar__initials">{initials}</span>
          </div>
          <h2 className="profile-display-name">{displayName}</h2>
          {username && <p className="profile-username">@{username}</p>}
          <button type="button" className="btn btn--primary" onClick={onEdit}>
            Edit profile
          </button>
        </div>

        {/* Stats */}
        <div className="card profile-stats">
          <StatItem value={saved} label="Saved" />
          <div className="profile-stats__divider" />
          <StatItem value={watched} label="Watched" />
        </div>

        {/* Recently Watched */}
        <div className="profile-section">
          <div className="profile-section__header">
            <p className="section-label">RECENTLY WATCHED</p>
            <button type="button" className="text-action">By mood</button>
          </div>
          {recentlyWatched.length === 0 ? (
            <p className="profile-empty">No watched movies yet</p>
          ) : (
            <div className="profile-watched-scroll">
              {recentlyWatched.map((movie) => (
                <WatchedCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <nav className="tab-bar">
        <TabItem icon={<HomeIcon />} label="Home" onClick={onGoToHome} />
        <TabItem icon={<ExploreIcon />} label="Explore" onClick={onGoToExplore} />
        <TabItem icon={<SavedIcon />} label="Saved" onClick={onGoToQueue} />
        <TabItem icon={<ProfileIcon />} label="Profile" active />
      </nav>
    </div>
  )
}

function StatItem({ value, label }) {
  return (
    <div className="profile-stat">
      <span className="profile-stat__value">{value}</span>
      <span className="profile-stat__label">{label}</span>
    </div>
  )
}

function WatchedCard({ movie }) {
  const rating = movie.ratingSource === 'filmweb' ? movie.ratingFilmweb : movie.ratingIMDb
  const firstMood = movie.moods?.[0] ?? null

  return (
    <div className="watched-card">
      <div className="watched-card__poster-wrap">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} className="watched-card__poster" />
        ) : (
          <div
            className="watched-card__poster watched-card__poster--placeholder"
            style={{ backgroundColor: getPosterColor(movie.id) }}
          >
            <span className="watched-card__poster-letter">{movie.title?.[0] ?? '?'}</span>
          </div>
        )}
        {rating != null && (
          <span className="watched-card__rating">★ {Number(rating).toFixed(1)}</span>
        )}
      </div>
      {firstMood && <span className="watched-card__mood">{firstMood}</span>}
    </div>
  )
}

function TabItem({ icon, label, active, onClick }) {
  return (
    <div
      className={`tab-item${active ? ' tab-item--active' : ''}${onClick ? ' tab-item--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ExploreIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function SavedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
