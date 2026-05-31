import { useState, useCallback } from 'react'
import { AuthProvider, useAuth } from './components/AuthProvider.jsx'
import { AuthScreen } from './components/AuthScreen.jsx'
import { fetchMoviesFromTMDB, fetchMovieDetails } from './data/tmdbService.js'
import { pickMovie } from './logic/pickMovie.js'
import { useFilterState } from './state/useFilterState.js'
import { FilterScreen } from './components/FilterScreen.jsx'
import { ResultScreen } from './components/ResultScreen.jsx'

// ─── Inner app — only rendered when user is known ────────────────────────────
function AppContent() {
  const { user, loading: authLoading } = useAuth()

  const [view, setView] = useState('filter')
  const [pickedMovie, setPickedMovie] = useState(null)
  const [filteredSet, setFilteredSet] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { filters, setters, clearAll } = useFilterState()

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

  // Not logged in → show auth screen
  if (!user) {
    return (
      <div className="app-shell">
        <div className="phone-frame">
          <AuthScreen />
        </div>
      </div>
    )
  }

  // Logged in → existing app
  return (
    <div className="app-shell">
      <div className="phone-frame">
        {view === 'filter' ? (
          <FilterScreen
            filters={filters}
            setters={setters}
            clearAll={clearAll}
            onGetPick={handleGetPick}
            loading={loading}
            error={error}
          />
        ) : (
          <ResultScreen
            movie={pickedMovie}
            filters={filters}
            onPickAgain={handlePickAgain}
            onBack={handleBack}
            onClearAndBack={handleClearAndBack}
            loading={loading}
            error={error}
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
