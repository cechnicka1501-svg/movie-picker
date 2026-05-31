import { useReducer, useCallback } from 'react'

const DEFAULTS = {
  searchScope: 'myServices',
  selectedServices: [],
  includeTVAiring: true,
  moods: [],
  ratingSource: 'imdb',
  minRating: 0,
  yearFrom: 1970,
  yearTo: 2026,
  runtime: 'any',
  genres: [],
  keywords: '',
  hideWatched: false,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH_SCOPE':
      return { ...state, searchScope: action.value }
    case 'TOGGLE_SERVICE': {
      const exists = state.selectedServices.includes(action.value)
      return {
        ...state,
        selectedServices: exists
          ? state.selectedServices.filter((s) => s !== action.value)
          : [...state.selectedServices, action.value],
      }
    }
    case 'SET_INCLUDE_TV_AIRING':
      return { ...state, includeTVAiring: action.value }
    case 'TOGGLE_MOOD': {
      const exists = state.moods.includes(action.value)
      return {
        ...state,
        moods: exists
          ? state.moods.filter((m) => m !== action.value)
          : [...state.moods, action.value],
      }
    }
    case 'SET_RATING_SOURCE':
      return { ...state, ratingSource: action.value }
    case 'SET_MIN_RATING':
      return { ...state, minRating: action.value }
    case 'SET_YEAR_FROM':
      return { ...state, yearFrom: Math.min(action.value, state.yearTo) }
    case 'SET_YEAR_TO':
      return { ...state, yearTo: Math.max(action.value, state.yearFrom) }
    case 'CLEAR_YEARS':
      return { ...state, yearFrom: DEFAULTS.yearFrom, yearTo: DEFAULTS.yearTo }
    case 'SET_RUNTIME':
      return { ...state, runtime: action.value }
    case 'TOGGLE_GENRE': {
      const exists = state.genres.includes(action.value)
      return {
        ...state,
        genres: exists
          ? state.genres.filter((g) => g !== action.value)
          : [...state.genres, action.value],
      }
    }
    case 'SET_KEYWORDS':
      return { ...state, keywords: action.value }
    case 'SET_HIDE_WATCHED':
      return { ...state, hideWatched: action.value }
    case 'CLEAR_ALL':
      return { ...DEFAULTS }
    default:
      return state
  }
}

export function useFilterState() {
  const [filters, dispatch] = useReducer(reducer, { ...DEFAULTS })

  const setters = {
    setSearchScope: useCallback((v) => dispatch({ type: 'SET_SEARCH_SCOPE', value: v }), []),
    toggleService: useCallback((v) => dispatch({ type: 'TOGGLE_SERVICE', value: v }), []),
    setIncludeTVAiring: useCallback((v) => dispatch({ type: 'SET_INCLUDE_TV_AIRING', value: v }), []),
    toggleMood: useCallback((v) => dispatch({ type: 'TOGGLE_MOOD', value: v }), []),
    setRatingSource: useCallback((v) => dispatch({ type: 'SET_RATING_SOURCE', value: v }), []),
    setMinRating: useCallback((v) => dispatch({ type: 'SET_MIN_RATING', value: v }), []),
    setYearFrom: useCallback((v) => dispatch({ type: 'SET_YEAR_FROM', value: v }), []),
    setYearTo: useCallback((v) => dispatch({ type: 'SET_YEAR_TO', value: v }), []),
    clearYears: useCallback(() => dispatch({ type: 'CLEAR_YEARS' }), []),
    setRuntime: useCallback((v) => dispatch({ type: 'SET_RUNTIME', value: v }), []),
    toggleGenre: useCallback((v) => dispatch({ type: 'TOGGLE_GENRE', value: v }), []),
    setKeywords: useCallback((v) => dispatch({ type: 'SET_KEYWORDS', value: v }), []),
    setHideWatched: useCallback((v) => dispatch({ type: 'SET_HIDE_WATCHED', value: v }), []),
  }

  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), [])

  return { filters, setters, clearAll }
}
