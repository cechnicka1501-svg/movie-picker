import { Chip } from './ui/Chip.jsx'
import { SegmentedToggle } from './ui/SegmentedToggle.jsx'
import { RangeSlider } from './ui/RangeSlider.jsx'
import { Toggle } from './ui/Toggle.jsx'
import { YearRange } from './ui/YearRange.jsx'
import { useAuth } from './AuthProvider.jsx'

const SERVICES = ['StreamFlix', 'WatchNow', 'CineStream', 'ViewHub']
const MOODS = ['Chill', 'Funny', 'Feel-good', 'Romantic', 'Cozy', 'Dark', 'Intense', 'Scary', 'Inspiring', 'Thoughtful', 'Adventure', 'Surprise me']
const GENRES = ['Drama', 'Comedy', 'Thriller', 'Romance', 'Sci-Fi', 'Horror', 'Action', 'Documentary']
const RUNTIME_OPTIONS = [
  { label: '< 90 min', value: '<90' },
  { label: '90–120', value: '90-120' },
  { label: 'Any', value: 'any' },
]
const SCOPE_OPTIONS = [
  { label: 'My services', value: 'myServices' },
  { label: 'All platforms', value: 'allPlatforms' },
]
const RATING_OPTIONS = [
  { label: 'IMDb', value: 'imdb' },
  { label: 'Filmweb', value: 'filmweb' },
]

export function FilterScreen({ filters, setters, clearAll, onGetPick, loading = false, error = null }) {
  const { signOut } = useAuth()
  const {
    searchScope, selectedServices, includeTVAiring, moods, ratingSource,
    minRating, yearFrom, yearTo, runtime, genres, keywords, hideWatched,
  } = filters

  return (
    <div className="filter-screen">
      {/* Header */}
      <div className="filter-header">
        <div className="filter-header__text">
          <h1 className="filter-header__title">What do you want to watch?</h1>
          <p className="filter-header__subtitle">We'll tailor the choice to your context.</p>
        </div>
        <div className="header-icons">
          <button type="button" className="icon-btn" aria-label="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button type="button" className="icon-btn icon-btn--logout" onClick={signOut} aria-label="Log out" title="Log out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="filter-body">
        {/* Search Scope */}
        <div className="card">
          <p className="section-label">SEARCH SCOPE</p>
          <SegmentedToggle options={SCOPE_OPTIONS} value={searchScope} onChange={setters.setSearchScope} />
          <p className="helper-text">Searching in: Your subscriptions (+ optional TV)</p>
          <div className="chip-group">
            {SERVICES.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={selectedServices.includes(s)}
                onClick={() => setters.toggleService(s)}
                disabled={searchScope === 'allPlatforms'}
              />
            ))}
          </div>
          <Toggle label="Include TV airing" checked={includeTVAiring} onChange={setters.setIncludeTVAiring} />
          <button type="button" className="text-action">Edit services</button>
        </div>

        {/* Mood + Rating Source */}
        <div className="card">
          <p className="section-label">FILTERS</p>
          <p className="subsection-label">Mood</p>
          <div className="chip-group">
            {MOODS.map((m) => (
              <Chip key={m} label={m} selected={moods.includes(m)} onClick={() => setters.toggleMood(m)} />
            ))}
          </div>
          <p className="subsection-label">Rating source</p>
          <SegmentedToggle options={RATING_OPTIONS} value={ratingSource} onChange={setters.setRatingSource} />
        </div>

        {/* Rating / Years / Runtime */}
        <div className="card">
          <p className="subsection-label">Min rating</p>
          <RangeSlider
            min={0} max={10} step={0.5} value={minRating}
            onChange={setters.setMinRating}
            formatValue={(v) => `${v.toFixed(1)}+`}
          />

          <p className="subsection-label">Years</p>
          <YearRange
            yearFrom={yearFrom} yearTo={yearTo}
            onYearFromChange={setters.setYearFrom}
            onYearToChange={setters.setYearTo}
            onClear={setters.clearYears}
          />

          <p className="subsection-label">Runtime</p>
          <div className="chip-group">
            {RUNTIME_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                selected={runtime === opt.value}
                onClick={() => setters.setRuntime(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* Genre */}
        <div className="card">
          <p className="section-label">GENRE</p>
          <div className="chip-group">
            {GENRES.map((g) => (
              <Chip key={g} label={g} selected={genres.includes(g)} onClick={() => setters.toggleGenre(g)} />
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="card">
          <p className="section-label">KEYWORDS</p>
          <input
            type="text"
            className="keywords-input"
            placeholder="Type keywords… e.g. 'rainy evening', 'slow burn', 'twist'"
            value={keywords}
            onChange={(e) => setters.setKeywords(e.target.value)}
          />
        </div>

        {/* Hide Watched */}
        <div className="card">
          <Toggle label="Hide watched" checked={hideWatched} onChange={setters.setHideWatched} />
        </div>
      </div>

      {/* Sticky Bottom */}
      <div className="bottom-actions">
        {error && <p className="fetch-error">{error}</p>}
        <button
          type="button"
          className={`btn btn--primary${loading ? ' btn--loading' : ''}`}
          onClick={onGetPick}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : 'Get 1 pick'}
        </button>
        <div className="btn-secondary-wrap">
          <button type="button" className="btn btn--secondary" disabled title="Coming later">
            Show results
          </button>
          <span className="coming-later-label">Coming later</span>
        </div>
        <button type="button" className="text-action text-action--center" onClick={clearAll}>
          Clear all
        </button>
      </div>

      {/* Decorative Tab Bar */}
      <nav className="tab-bar">
        <TabItem icon={<HomeIcon />} label="Home" />
        <TabItem icon={<ExploreIcon />} label="Explore" active />
        <TabItem icon={<SavedIcon />} label="Saved" />
        <TabItem icon={<ProfileIcon />} label="Profile" />
      </nav>
    </div>
  )
}

function TabItem({ icon, label, active }) {
  return (
    <div className={`tab-item${active ? ' tab-item--active' : ''}`}>
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
