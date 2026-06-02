import { useState, useEffect } from 'react'
import { getRecommendations } from '../logic/getRecommendations.js'

const POSTER_COLORS = [
  '#3D2B4A', '#2B3D4A', '#4A3D2B', '#2B4A3D', '#4A2B3D',
  '#3D4A2B', '#2B2B4A', '#4A4A2B', '#2B4A4A', '#4A2B2B',
]

function getPosterColor(id) {
  return POSTER_COLORS[id % POSTER_COLORS.length]
}

export function HomeScreen({
  watchedHistory,
  queue,
  onSave,
  isInQueue,
  onGoToExplore,
  onGoToQueue,
  onGoToProfile,
  onGoToHome,
}) {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const hasHistory = watchedHistory.length > 0

  useEffect(() => {
    if (!hasHistory) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    const allItems = [...watchedHistory, ...queue]

    getRecommendations(watchedHistory, allItems)
      .then((result) => {
        if (!cancelled) {
          setSections(result)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load recommendations. Check your connection.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [hasHistory]) // Re-run when user gains/loses watch history

  return (
    <div className="screen home-screen">
      {/* Header */}
      <div className="home-header">
        <div className="home-header__text">
          <h1 className="home-header__title">For You</h1>
          {hasHistory && (
            <p className="home-header__subtitle">Based on what you've watched</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="home-body">
        {!hasHistory ? (
          /* ── Empty state ────────────────────────────────────────────── */
          <div className="home-empty">
            <div className="home-empty__icon">🎬</div>
            <h2 className="home-empty__title">No recommendations yet</h2>
            <p className="home-empty__hint">
              Watch some movies first and we'll learn your taste.
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onGoToExplore}
            >
              Go explore
            </button>
          </div>
        ) : loading ? (
          /* ── Loading ────────────────────────────────────────────────── */
          <div className="home-loading">
            <span className="spinner spinner--dark" />
          </div>
        ) : error ? (
          /* ── Error ──────────────────────────────────────────────────── */
          <div className="home-empty">
            <p className="fetch-error">{error}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onGoToExplore}
            >
              Go explore
            </button>
          </div>
        ) : sections.length === 0 ? (
          /* ── No results after fetch ─────────────────────────────────── */
          <div className="home-empty">
            <div className="home-empty__icon">🎬</div>
            <h2 className="home-empty__title">Nothing new to suggest</h2>
            <p className="home-empty__hint">
              You may have seen everything in your favourite genres. Try exploring!
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={onGoToExplore}
            >
              Go explore
            </button>
          </div>
        ) : (
          /* ── Recommendation sections ────────────────────────────────── */
          sections.map((section) => (
            <RecommendationSection
              key={section.id}
              section={section}
              isInQueue={isInQueue}
              onSave={onSave}
            />
          ))
        )}
      </div>

      {/* Tab Bar */}
      <nav className="tab-bar">
        <TabItem icon={<HomeIcon />}    label="Home"    active />
        <TabItem icon={<ExploreIcon />} label="Explore" onClick={onGoToExplore} />
        <TabItem icon={<SavedIcon />}   label="Saved"   onClick={onGoToQueue} />
        <TabItem icon={<ProfileIcon />} label="Profile" onClick={onGoToProfile} />
      </nav>
    </div>
  )
}

/* ── Recommendation section (one horizontal row) ─────────────────────────── */
function RecommendationSection({ section, isInQueue, onSave }) {
  return (
    <div className="home-section">
      <p className="home-section__title">{section.title}</p>
      <div className="home-section__scroll">
        {section.movies.map((movie) => (
          <HomeMovieCard
            key={movie.id}
            movie={movie}
            saved={isInQueue && isInQueue(movie.id)}
            onSave={() => onSave(movie, 'imdb')}
          />
        ))}
      </div>
    </div>
  )
}

/* ── Individual movie card ───────────────────────────────────────────────── */
function HomeMovieCard({ movie, saved, onSave }) {
  const rating = movie.ratingIMDb

  return (
    <div className="home-card">
      {/* Poster */}
      <div className="home-card__poster-wrap">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="home-card__poster"
          />
        ) : (
          <div
            className="home-card__poster home-card__poster--placeholder"
            style={{ backgroundColor: getPosterColor(movie.id) }}
          >
            <span className="home-card__poster-letter">
              {movie.title?.[0] ?? '?'}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="home-card__info">
        <p className="home-card__title">{movie.title}</p>
        <p className="home-card__meta">
          {movie.year || ''}
          {rating ? ` · ★ ${Number(rating).toFixed(1)}` : ''}
        </p>
        <button
          type="button"
          className={`home-card__save-btn${saved ? ' home-card__save-btn--saved' : ''}`}
          onClick={saved ? undefined : onSave}
          disabled={saved}
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </div>
  )
}

/* ── Tab bar helpers (same pattern as other screens) ─────────────────────── */
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
