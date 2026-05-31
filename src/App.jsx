import { useState, useCallback } from 'react'
import { fetchMoviesFromTMDB, fetchMovieDetails } from './data/tmdbService.js'
import { pickMovie } from './logic/pickMovie.js'
import { useFilterState } from './state/useFilterState.js'
import { FilterScreen } from './components/FilterScreen.jsx'
import { ResultScreen } from './components/ResultScreen.jsx'

export default function App() {
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

      // Fetch full details for the picked movie to get runtime
      const detailed = await fetchMovieDetails(basicPick.id)
      setFilteredSet(movies)
      setPickedMovie(detailed)
      setView('result')
    } catch (err) {
      setError('Nie udało się pobrać filmów. Sprawdź połączenie z internetem.')
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
      setError('Nie udało się pobrać szczegółów filmu.')
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
