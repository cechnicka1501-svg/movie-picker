import { Chip } from './ui/Chip.jsx'

const POSTER_COLORS = [
  '#3D2B4A', '#2B3D4A', '#4A3D2B', '#2B4A3D', '#4A2B3D',
  '#3D4A2B', '#2B2B4A', '#4A4A2B', '#2B4A4A', '#4A2B2B',
]

function getPosterColor(id) {
  return POSTER_COLORS[id % POSTER_COLORS.length]
}

function buildWhyThisPick(movie, filters) {
  const reasons = []

  if (filters.moods.length > 0) {
    const matched = filters.moods.filter((m) => movie.moods.includes(m))
    if (matched.length > 0) reasons.push(`Matched mood${matched.length > 1 ? 's' : ''}: ${matched.join(', ')}`)
  }

  if (filters.genres.length > 0) {
    const matched = filters.genres.filter((g) => movie.genres.includes(g))
    if (matched.length > 0) reasons.push(`Matched genre${matched.length > 1 ? 's' : ''}: ${matched.join(', ')}`)
  }

  const rating = filters.ratingSource === 'imdb' ? movie.ratingIMDb : movie.ratingFilmweb
  const source = filters.ratingSource === 'imdb' ? 'IMDb' : 'Filmweb'
  if (filters.minRating > 0) {
    reasons.push(`${source} rating ${rating.toFixed(1)} meets your minimum of ${filters.minRating.toFixed(1)}`)
  }

  if (filters.keywords.trim()) {
    reasons.push(`Keyword match for "${filters.keywords.trim()}"`)
  }

  if (filters.searchScope === 'myServices' && filters.selectedServices.length > 0) {
    const matched = filters.selectedServices.filter((s) => movie.services.includes(s))
    if (matched.length > 0) reasons.push(`Available on: ${matched.join(', ')}`)
  }

  if (reasons.length === 0) reasons.push('Randomly picked from all available titles')

  return reasons
}

export function ResultScreen({ movie, filters, onPickAgain, onBack, onClearAndBack, loading = false, error = null, onSave, onRemoveFromQueue, isInQueue, onGoToQueue }) {
  if (!movie) {
    return (
      <div className="result-screen result-screen--empty">
        <div className="no-results">
          <div className="no-results__icon">🎬</div>
          <h2 className="no-results__title">No movies match your filters</h2>
          <p className="no-results__hint">Try loosening some filters — fewer genres, wider year range, or a lower rating threshold.</p>
          <button type="button" className="btn btn--primary" onClick={onBack}>
            Back to filters
          </button>
          <button type="button" className="text-action text-action--center" onClick={onClearAndBack}>
            Clear all filters and try again
          </button>
        </div>
        <nav className="tab-bar">
          <TabItem icon={<HomeIcon />} label="Home" />
          <TabItem icon={<ExploreIcon />} label="Explore" active />
          <TabItem icon={<SavedIcon />} label="Saved" onClick={onGoToQueue} />
          <TabItem icon={<ProfileIcon />} label="Profile" />
        </nav>
      </div>
    )
  }

  const ratingValue = filters.ratingSource === 'imdb' ? movie.ratingIMDb : movie.ratingFilmweb
  const ratingLabel = filters.ratingSource === 'imdb' ? 'IMDb' : 'Filmweb'
  const whyReasons = buildWhyThisPick(movie, filters)
  const saved = isInQueue && isInQueue(movie.id)

  return (
    <div className="result-screen">
      <div className="result-body">
        {/* Back link */}
        <button type="button" className="back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to filters
        </button>

        {/* Poster */}
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="poster-img"
          />
        ) : (
          <div
            className="poster"
            style={{ backgroundColor: getPosterColor(movie.id) }}
          >
            <span className="poster__title">{movie.title}</span>
          </div>
        )}

        {/* Meta */}
        <div className="result-meta">
          <h2 className="result-title">{movie.title}</h2>
          <div className="result-details">
            <span className="result-detail">{movie.year}</span>
            <span className="result-detail-sep">·</span>
            <span className="result-detail">{movie.runtime} min</span>
            <span className="result-detail-sep">·</span>
            <span className="result-detail result-detail--rating">{ratingLabel} {ratingValue.toFixed(1)}</span>
          </div>
          <div className="chip-group chip-group--sm">
            {movie.genres.map((g) => (
              <span key={g} className="chip chip--display">{g}</span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <p className="result-description">{movie.description}</p>
        </div>

        {/* Why this pick */}
        <div className="card">
          <p className="section-label">WHY THIS PICK</p>
          <ul className="why-list">
            {whyReasons.map((reason, i) => (
              <li key={i} className="why-list__item">
                <span className="why-list__dot" />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        {error && <p className="fetch-error">{error}</p>}
        <div className="result-actions">
          <button
            type="button"
            className={`btn btn--primary${loading ? ' btn--loading' : ''}`}
            onClick={onPickAgain}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Pick again'}
          </button>
          <button
            type="button"
            className={`btn ${saved ? 'btn--saved' : 'btn--save'}`}
            onClick={() => saved ? onRemoveFromQueue(movie.id) : onSave(movie, filters.ratingSource)}
          >
            {saved ? '✓ Saved' : 'Save to Watch Queue'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back to filters
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <nav className="tab-bar">
        <TabItem icon={<HomeIcon />} label="Home" />
        <TabItem icon={<ExploreIcon />} label="Explore" active />
        <TabItem icon={<SavedIcon />} label="Saved" onClick={onGoToQueue} />
        <TabItem icon={<ProfileIcon />} label="Profile" />
      </nav>
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
