const POSTER_COLORS = [
  '#3D2B4A', '#2B3D4A', '#4A3D2B', '#2B4A3D', '#4A2B3D',
  '#3D4A2B', '#2B2B4A', '#4A4A2B', '#2B4A4A', '#4A2B2B',
]

function getPosterColor(id) {
  return POSTER_COLORS[id % POSTER_COLORS.length]
}

export function WatchQueueScreen({ queue, onRemove, onToggleWatched, onGoToExplore, onGoToProfile, onGoToHome }) {
  return (
    <div className="screen queue-screen">
      {/* Header */}
      <div className="queue-header">
        <div className="queue-header__text">
          <h1 className="queue-header__title">Watch Queue</h1>
          <p className="queue-header__subtitle">
            {queue.length === 0 ? 'Nothing saved yet' : `${queue.length} movie${queue.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        <button type="button" className="icon-btn" aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="queue-body">
        {queue.length === 0 ? (
          <div className="queue-empty">
            <div className="queue-empty__icon">🎬</div>
            <h2 className="queue-empty__title">No movies saved yet</h2>
            <p className="queue-empty__hint">Go pick one and tap "Save to Watch Queue"!</p>
            <button type="button" className="btn btn--primary" onClick={onGoToExplore}>
              Pick a movie
            </button>
          </div>
        ) : (
          <div className="queue-list">
            {queue.map((movie) => (
              <QueueCard
                key={movie.id}
                movie={movie}
                onToggleWatched={() => onToggleWatched(movie.id)}
                onRemove={() => onRemove(movie.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <nav className="tab-bar">
        <TabItem icon={<HomeIcon />} label="Home" onClick={onGoToHome} />
        <TabItem icon={<ExploreIcon />} label="Explore" onClick={onGoToExplore} />
        <TabItem icon={<SavedIcon />} label="Saved" active />
        <TabItem icon={<ProfileIcon />} label="Profile" onClick={onGoToProfile} />
      </nav>
    </div>
  )
}

function QueueCard({ movie, onToggleWatched, onRemove }) {
  const ratingLabel = movie.ratingSource === 'filmweb' ? 'Filmweb' : 'IMDb'
  const ratingValue = movie.ratingSource === 'filmweb' ? movie.ratingFilmweb : movie.ratingIMDb
  const displayGenres = (movie.genres || []).slice(0, 3)

  return (
    <div className={`queue-card${movie.queueWatched ? ' queue-card--watched' : ''}`}>
      {/* Poster thumbnail */}
      {movie.poster ? (
        <img src={movie.poster} alt={movie.title} className="queue-card__poster" />
      ) : (
        <div
          className="queue-card__poster queue-card__poster--placeholder"
          style={{ backgroundColor: getPosterColor(movie.id) }}
        >
          <span className="queue-card__poster-title">{movie.title?.[0] ?? '?'}</span>
        </div>
      )}

      {/* Info */}
      <div className="queue-card__info">
        <p className="queue-card__title">{movie.title}</p>
        <p className="queue-card__meta">
          {movie.year}
          {movie.runtime ? ` · ${movie.runtime} min` : ''}
          {ratingValue != null ? ` · ★ ${Number(ratingValue).toFixed(1)}` : ''}
        </p>
        {displayGenres.length > 0 && (
          <div className="queue-card__genres">
            {displayGenres.map((g) => (
              <span key={g} className="chip chip--display">{g}</span>
            ))}
          </div>
        )}
        {/* Actions */}
        <div className="queue-card__actions">
          <button
            type="button"
            className={`queue-card__watched-btn${movie.queueWatched ? ' queue-card__watched-btn--active' : ''}`}
            onClick={onToggleWatched}
          >
            {movie.queueWatched ? '✓ Watched' : 'Mark watched'}
          </button>
          <button
            type="button"
            className="queue-card__remove-btn"
            onClick={onRemove}
            aria-label="Remove from queue"
          >
            Remove
          </button>
        </div>
      </div>
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
