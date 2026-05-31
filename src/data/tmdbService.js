const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500'

// Map our genre names → TMDB genre IDs
const GENRE_TO_ID = {
  Action: 28,
  Comedy: 35,
  Documentary: 99,
  Drama: 18,
  Horror: 27,
  Romance: 10749,
  'Sci-Fi': 878,
  Thriller: 53,
}

// Reverse map: TMDB genre ID → our genre name
const ID_TO_GENRE = Object.fromEntries(
  Object.entries(GENRE_TO_ID).map(([name, id]) => [id, name])
)

/**
 * Fetch a list of movies from TMDB based on current filters.
 * Returns an array of movies in our app's schema (without runtime — fetched separately).
 */
export async function fetchMoviesFromTMDB(filters) {
  const { genres, minRating, yearFrom, yearTo, runtime, keywords } = filters

  const params = new URLSearchParams({
    api_key: API_KEY,
    language: 'en-US',
    include_adult: 'false',
    page: '1',
  })

  let endpoint

  if (keywords.trim()) {
    // Keyword search uses a different endpoint
    params.set('query', keywords.trim())
    endpoint = `${BASE_URL}/search/movie?${params}`
  } else {
    // Discovery endpoint supports structured filters
    params.set('sort_by', 'popularity.desc')

    if (genres.length > 0) {
      const ids = genres.map((g) => GENRE_TO_ID[g]).filter(Boolean).join(',')
      if (ids) params.set('with_genres', ids)
    }

    if (minRating > 0) {
      params.set('vote_average.gte', String(minRating))
      params.set('vote_count.gte', '100') // avoid obscure low-vote films
    }

    params.set('primary_release_date.gte', `${yearFrom}-01-01`)
    params.set('primary_release_date.lte', `${yearTo}-12-31`)

    if (runtime === '<90') {
      params.set('with_runtime.lte', '89')
    } else if (runtime === '90-120') {
      params.set('with_runtime.gte', '90')
      params.set('with_runtime.lte', '120')
    }

    endpoint = `${BASE_URL}/discover/movie?${params}`
  }

  const res = await fetch(endpoint)
  if (!res.ok) throw new Error(`TMDB ${res.status}`)

  const data = await res.json()
  return (data.results ?? []).map(mapBasic)
}

/**
 * Fetch full details for a single movie (includes runtime).
 * Call this after picking a random movie from the list.
 */
export async function fetchMovieDetails(tmdbId) {
  const params = new URLSearchParams({ api_key: API_KEY, language: 'en-US' })
  const res = await fetch(`${BASE_URL}/movie/${tmdbId}?${params}`)
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return mapFull(await res.json())
}

// ─── Mappers ────────────────────────────────────────────────────────────────

function mapBasic(m) {
  return {
    id: m.id,
    title: m.title ?? 'Unknown',
    year: parseYear(m.release_date),
    runtime: 0, // not returned by list endpoints — filled in by mapFull
    ratingIMDb: round1(m.vote_average),
    ratingFilmweb: round1(m.vote_average),
    genres: (m.genre_ids ?? []).map((id) => ID_TO_GENRE[id]).filter(Boolean),
    moods: [],
    keywords: [],
    watched: false,
    services: [],
    tvAiring: false,
    description: m.overview ?? '',
    poster: m.poster_path ? `${POSTER_BASE}${m.poster_path}` : null,
  }
}

function mapFull(m) {
  return {
    id: m.id,
    title: m.title ?? 'Unknown',
    year: parseYear(m.release_date),
    runtime: m.runtime ?? 0,
    ratingIMDb: round1(m.vote_average),
    ratingFilmweb: round1(m.vote_average),
    genres: (m.genres ?? []).map((g) => ID_TO_GENRE[g.id]).filter(Boolean),
    moods: [],
    keywords: [],
    watched: false,
    services: [],
    tvAiring: false,
    description: m.overview ?? '',
    poster: m.poster_path ? `${POSTER_BASE}${m.poster_path}` : null,
  }
}

function parseYear(dateStr) {
  return dateStr ? parseInt(dateStr.split('-')[0], 10) : 0
}

function round1(n) {
  return Math.round((n ?? 0) * 10) / 10
}
