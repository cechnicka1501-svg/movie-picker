import { useState, useCallback } from 'react'
import { AuthProvider, useAuth } from './components/AuthProvider.jsx'
import { AuthScreen } from './components/AuthScreen.jsx'
import { fetchMoviesFromTMDB, fetchMovieDetails } from './data/tmdbService.js'
import { pickMovie } from './logic/pickMovie.js'
import { useFilterState } from './state/useFilterState.js'
import { useWatchQueue } from './state/useWatchQueue.js'
import { FilterScreen } from './components/FilterScreen.jsx'
import { ResultScreen } from './components/ResultScreen.jsx'
import { ResultsListScreen } from './components/ResultsListScreen.jsx'
import { WatchQueueScreen } from './components/WatchQueueScreen.jsx'
import { ProfileScreen } from './components/ProfileScreen.jsx'
import { EditProfileScreen } from './components/EditProfileScreen.jsx'
import { ServicesSettingsScreen } from './components/ServicesSettingsScreen.jsx'
import { HomeScreen } from './components/HomeScreen.jsx'
import { GuestPromptScreen } from './components/GuestPromptScreen.jsx'

// ─── Inner app — only rendered when user is known ────────────────────────────
function AppContent() {
  const { user, loading: authLoading, isGuest } = useAuth()

  const [view, setView] = useState('filter') // 'home' | 'filter' | 'result' | 'results' | 'queue' | 'profile' | 'editProfile' | 'settings'
  const [pickedMovie, setPickedMovie] = useState(null)
  const [filteredSet, setFilteredSet] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { filters, setters, clearAll } = useFilterState()
  const { queue, watchedHistory, addToQueue, removeFromQueue, isInQueue, toggleWatched } = useWatchQueue(user?.id)

  const handleGetPick = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const movies = await fetchMoviesFromTMDB(filters)
      const basicPick = pickMovie(movies)
      if (!basicPick) {
        setFilteredSet([])
        setPickedMovie(null)
        setView('result')
        return
      }
      const detailed = await fetchMovieDetails(basicPick.id)
      setFilteredSet(movies)
      setPickedMovie(detailed)
      setView('result')
    } catch (err) {
      setError('Could not fetch movies. Check your internet connection.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handleShowResults = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const movies = await fetchMoviesFromTMDB(filters)
      setFilteredSet(movies)
      setView('results')
    } catch (err) {
      setError('Could not fetch movies. Check your internet connection.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const handlePickAgain = useCallback(async () => {
    if (filteredSet.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const basicPick = pickMovie(filteredSet)
      const detailed = await fetchMovieDetails(basicPick.id)
      setPickedMovie(detailed)
    } catch (err) {
      setError('Could not fetch movie details.')
    } finally {
      setLoading(false)
    }
  }, [filteredSet])

  const handleBack = useCallback(() => {
    setView('filter')
    setError(null)
  }, [])

  const handleClearAndBack = useCallback(() => {
    clearAll()
    setView('filter')
    setError(null)
  }, [clearAll])

  const handleGoToQueue    = useCallback(() => { setView(isGuest ? 'guestPrompt' : 'queue');   setError(null) }, [isGuest])
  const handleGoToExplore  = useCallback(() => { setView('filter');  setError(null) }, [])
  const handleGoToProfile  = useCallback(() => { setView(isGuest ? 'guestPrompt' : 'profile'); setError(null) }, [isGuest])
  const handleGoToEdit        = useCallback(() => { setView('editProfile') }, [])
  const handleBackFromEdit    = useCallback(() => { setView('profile') }, [])
  const handleGoToHome        = useCallback(() => { setView('home');    setError(null) }, [])
  const handleGoToSettings    = useCallback(() => { setView('settings') }, [])
  const handleBackFromSettings = useCallback(() => { setView('filter') }, [])

  // While Supabase checks the session, show a spinner
  if (authLoading) {
    return (
      <div className="app-shell">
        <div className="phone-frame auth-loading-frame">
          <span className="spinner spinner--dark" />
        </div>
      </div>
    )
  }

  // Not logged in and not guest → show auth screen
  if (!user && !isGuest) {
    return (
      <div className="app-shell">
        <div className="phone-frame">
          <AuthScreen />
        </div>
      </div>
    )
  }

  // Logged in → app views
  return (
    <div className="app-shell">
      <div className="phone-frame">
        {view === 'home' && (
          <HomeScreen
            watchedHistory={watchedHistory}
            queue={queue}
            onSave={addToQueue}
            isInQueue={isInQueue}
            onGoToExplore={handleGoToExplore}
            onGoToQueue={handleGoToQueue}
            onGoToProfile={handleGoToProfile}
            onGoToHome={handleGoToHome}
          />
        )}
        {view === 'filter' && (
          <FilterScreen
            filters={filters}
            setters={setters}
            clearAll={clearAll}
            onGetPick={handleGetPick}
            onShowResults={handleShowResults}
            loading={loading}
            error={error}
            onGoToQueue={handleGoToQueue}
            onGoToProfile={handleGoToProfile}
            onGoToSettings={handleGoToSettings}
            onGoToHome={handleGoToHome}
            user={user}
          />
        )}
        {view === 'result' && (
          <ResultScreen
            movie={pickedMovie}
            filters={filters}
            onPickAgain={handlePickAgain}
            onBack={handleBack}
            onClearAndBack={handleClearAndBack}
            loading={loading}
            error={error}
            onSave={addToQueue}
            onRemoveFromQueue={removeFromQueue}
            isInQueue={isInQueue}
            onGoToQueue={handleGoToQueue}
            onGoToProfile={handleGoToProfile}
            onGoToHome={handleGoToHome}
            isGuest={isGuest}
          />
        )}
        {view === 'results' && (
          <ResultsListScreen
            movies={filteredSet}
            filters={filters}
            loading={loading}
            onBack={handleBack}
            onGoToQueue={handleGoToQueue}
            onGoToProfile={handleGoToProfile}
            onSave={addToQueue}
            onRemoveFromQueue={removeFromQueue}
            isInQueue={isInQueue}
            queueCount={queue.length}
            onGoToHome={handleGoToHome}
            isGuest={isGuest}
          />
        )}
        {view === 'queue' && (
          <WatchQueueScreen
            queue={queue}
            onRemove={removeFromQueue}
            onToggleWatched={toggleWatched}
            onGoToExplore={handleGoToExplore}
            onGoToProfile={handleGoToProfile}
            onGoToHome={handleGoToHome}
          />
        )}
        {view === 'profile' && (
          <ProfileScreen
            user={user}
            queue={queue}
            watchedHistory={watchedHistory}
            onEdit={handleGoToEdit}
            onGoToExplore={handleGoToExplore}
            onGoToQueue={handleGoToQueue}
            onGoToHome={handleGoToHome}
          />
        )}
        {view === 'editProfile' && (
          <EditProfileScreen
            user={user}
            onBack={handleBackFromEdit}
          />
        )}
        {view === 'settings' && (
          <ServicesSettingsScreen
            user={user}
            onBack={handleBackFromSettings}
          />
        )}
        {view === 'guestPrompt' && (
          <GuestPromptScreen
            onGoToHome={handleGoToHome}
            onGoToExplore={handleGoToExplore}
            onGoToQueue={handleGoToQueue}
            onGoToProfile={handleGoToProfile}
          />
        )}
      </div>
    </div>
  )
}

// ─── Root — provides auth context to the whole tree ──────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
