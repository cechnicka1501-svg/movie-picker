import { useState } from 'react'

const POSTER_COLORS = [
  '#3D2B4A', '#2B3D4A', '#4A3D2B', '#2B4A3D', '#4A2B3D',
  '#3D4A2B', '#2B2B4A', '#4A4A2B', '#2B4A4A', '#4A2B2B',
]

function getPosterColor(id) {
  return POSTER_COLORS[id % POSTER_COLORS.length]
}

// Build active filter chip labels from current filter state
function getActiveChips(filters) {
  const chips = []
  const { searchScope, selectedServices, moods, genres, ratingSource, minRating,
          yearFrom, yearTo, runtime, keywords, hideWatched } = filters

  if (searchScope === 'myServices' && selectedServices.length > 0) chips.push('My services')
  moods.forEach((m) => chips.push(m))
  genres.forEach((g) => chips.push(g))
  if (minRating > 0) {
    chips.push(`${ratingSource === 'imdb' ? 'IMDb' : 'Filmweb'} ${minRating.toFixed(1)}+`)
  }
  if (yearFrom !== 1970 || yearTo !== 2026) chips.push(`${yearFrom}–${yearTo}`)
  if (runtime === '<90') chips.push('< 90 min')
  if (runtime === '90-120') chips.push('90–120 min')
  if (keywords.trim()) chips.push(`"${keywords.trim()}"`)
  if (hideWatched) chips.push('Hide watched')
  return chips
}

export function ResultsListScreen({
  movies,
  filters,
  loading = false,
  onBack,
  onGoToQueue,
  onGoToProfile,
  onSave,
  onRemoveFromQueue,
  isInQueue,
  queueCount = 0,
  onGoToHome,
  isGuest = false,
}) {
  const [skipped, setSkipped] = useState([])
  const activeChips = getActiveChips(filters)
  const ratingSource = filters.ratingSource
  const firstMood = filters.moods[0] ?? null
  const visibleMovies = movies.filter((m) => !skipped.includes(m.id))

  return (
    <div className="screen results-screen">
      {/* Header */}
      <div className="results-header">
        <div className="results-header__top">
          <h1 className="results-header__title">StreamLens</h1>
          <div className="header-icons">
            <button type="button" className="icon-btn" aria-label="Search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="results-filter-row">
            <div className="results-filter-chips">
              {activeChips.map((chip) => (
                <span key={chip} className="results-filter-chip">{chip}</span>
              ))}
            </div>
          </div>
        )}

        <button type="button" className="text-action results-adjust-link" onClick={onBack}>
          Adjust filters
        </button>
      </div>

      {/* Toggle */}
      <div className="results-toggle-wrap">
        <div className="results-toggle">
          <div className="results-toggle__option results-toggle__option--disabled" title="Coming later">
            Swipe picks
            <span className="results-toggle__coming">soon</span>
          </div>
          <div className="results-toggle__option results-toggle__option--active">
            See choices
          </div>
        </div>
        {!loading && (
          <span className="results-count">
            {visibleMovies.length} {visibleMovies.length === 1 ? 'movie' : 'movies'}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="results-body">
        {loading ? (
          <div className="results-loading">
            <span className="spinner spinner--dark" />
          </div>
        ) : visibleMovies.length === 0 ? (
          <div className="results-empty">
            <div className="results-empty__icon">🎬</div>
            <h2 className="results-empty__title">No movies match your filters</h2>
            <p className="results-empty__hint">Try loosening some filters — fewer genres, wider year range, or a lower rating threshold.</p>
            <button type="button" className="btn btn--primary" onClick={onBack}>
              Adjust filters
            </button>
          </div>
        ) : (
          <div className="results-list">
            {visibleMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                ratingSource={ratingSource}
                firstMood={firstMood}
                saved={isInQueue && isInQueue(movie.id)}
                onSave={() => onSave(movie, ratingSource)}
                onRemove={() => onRemoveFromQueue(movie.id)}
                onSkip={() => setSkipped((prev) => [...prev, movie.id])}
                isGuest={isGuest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating save counter */}
      {queueCount > 0 && (
        <button
          type="button"
          className="results-fab"
          onClick={onGoToQueue}
          aria-label="Go to Watch Queue"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span>{queueCount}</span>
        </button>
      )}

      {/* Tab Bar */}
      <nav className="tab-bar">
        <TabItem icon={<HomeIcon />} label="Home" onClick={onGoToHome} />
        <TabItem icon={<ExploreIcon />} label="Explore" active />
        <TabItem icon={<SavedIcon />} label="Saved" onClick={onGoToQueue} />
        <TabItem icon={<ProfileIcon />} label="Profile" onClick={onGoToProfile} />
      </nav>
    </div>
  )
}

function MovieCard({ movie, ratingSource, firstMood, saved, onSave, onRemove, onSkip, isGuest }) {
  const [guestMsg, setGuestMsg] = useState(false)
  const rating = ratingSource === 'filmweb' ? movie.ratingFilmweb : movie.ratingIMDb
  const displayGenres = (movie.genres || []).slice(0, 3)

  function handleSave() {
    if (isGuest) {
      setGuestMsg(true)
      setTimeout(() => setGuestMsg(false), 2500)
      return
    }
    onSave()
  }

  return (
    <div className="results-card">
      {/* Poster */}
      {movie.poster ? (
        <img src={movie.poster} alt={movie.title} className="results-card__poster" />
      ) : (
        <div
          className="results-card__poster results-card__poster--placeholder"
          style={{ backgroundColor: getPosterColor(movie.id) }}
        >
          <span className="results-card__poster-letter">{movie.title?.[0] ?? '?'}</span>
        </div>
      )}

      {/* Info */}
      <div className="results-card__info">
        <p className="results-card__title">{movie.title}</p>
        <p className="results-card__meta">
          {movie.year || ''}
          {rating ? ` · ★ ${Number(rating).toFixed(1)}` : ''}
        </p>

        {displayGenres.length > 0 && (
          <div className="results-card__genres">
            {displayGenres.map((g) => (
              <span key={g} className="chip chip--display">{g}</span>
            ))}
          </div>
        )}

        {firstMood && (
          <p className="results-card__mood">Good for: {firstMood}</p>
        )}

        {/* Actions */}
        <div className="results-card__actions">
          <button
            type="button"
            className={`results-card__save-btn${saved ? ' results-card__save-btn--saved' : ''}`}
            onClick={saved ? onRemove : handleSave}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
          <button type="button" className="results-card__skip-btn" onClick={onSkip}>
            Skip
          </button>
          {guestMsg && <p className="guest-save-msg">Sign in to save movies</p>}
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
