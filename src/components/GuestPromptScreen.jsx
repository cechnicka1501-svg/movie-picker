import { useAuth } from './AuthProvider.jsx'

export function GuestPromptScreen({ onGoToHome, onGoToExplore, onGoToQueue, onGoToProfile }) {
  const { exitGuestMode } = useAuth()

  return (
    <div className="screen guest-prompt-screen">
      <div className="guest-prompt__body">
        <div className="guest-prompt__icon">🔒</div>
        <h2 className="guest-prompt__title">Account required</h2>
        <p className="guest-prompt__hint">
          Create an account to save movies and track your watchlist.
        </p>
        <button type="button" className="btn btn--primary" onClick={exitGuestMode}>
          Sign in
        </button>
      </div>

      <nav className="tab-bar">
        <TabItem icon={<HomeIcon />}    label="Home"    onClick={onGoToHome} />
        <TabItem icon={<ExploreIcon />} label="Explore" onClick={onGoToExplore} />
        <TabItem icon={<SavedIcon />}   label="Saved" />
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
