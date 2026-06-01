import { fetchMoviesFromTMDB } from '../data/tmdbService.js'

// Base filters used for all recommendation fetches.
// Searching all platforms, no service/mood/keyword constraints.
const BASE_FILTERS = {
  searchScope: 'allPlatforms',
  selectedServices: [],
  includeTVAiring: false,
  moods: [],
  ratingSource: 'imdb',
  minRating: 6.0,
  yearFrom: 1970,
  yearTo: 2026,
  runtime: 'any',
  genres: [],
  keywords: '',
  hideWatched: false,
}

/**
 * Count genre occurrences across the user's watched movies and return
 * the most common ones, sorted by frequency descending.
 */
function getTopGenres(watchedMovies, limit = 3) {
  const counts = {}
  for (const movie of watchedMovies) {
    for (const genre of movie.genres ?? []) {
      counts[genre] = (counts[genre] || 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre)
}

/**
 * Build personalised recommendation sections from the user's watch history.
 *
 * @param {object[]} watchedMovies  – movies with queueWatched = true
 * @param {object[]} allQueueItems  – all saved + watched items (for exclusion)
 * @returns {Promise<Array<{ id: string, title: string, movies: object[] }>>}
 *
 * Returns an empty array when the user has no watch history.
 * Each section has { id, title, movies[] } where movies use the app's movie schema.
 *
 * NOTE: This function is intentionally simple and self-contained so it can be
 * replaced by a real recommendation API later without touching HomeScreen.
 */
export async function getRecommendations(watchedMovies, allQueueItems) {
  if (watchedMovies.length === 0) return []

  // IDs to exclude: movies the user has already saved or watched
  const excludedIds = new Set(allQueueItems.map((m) => m.id))

  const topGenres = getTopGenres(watchedMovies, 3)

  const sections = []

  // ── Section 1: General "More like what you watched" ─────────────────────────
  // Uses the top 2 genres together for a broad mix
  try {
    const movies = await fetchMoviesFromTMDB({
      ...BASE_FILTERS,
      genres: topGenres.slice(0, 2),
      minRating: 6.0,
    })
    const filtered = movies.filter((m) => !excludedIds.has(m.id)).slice(0, 20)
    if (filtered.length > 0) {
      sections.push({
        id: 'general',
        title: 'More like what you watched',
        movies: filtered,
      })
    }
  } catch (_) {
    // Network error — skip this section rather than breaking the whole screen
  }

  // ── Sections 2+: One row per top genre ──────────────────────────────────────
  for (const genre of topGenres) {
    try {
      const movies = await fetchMoviesFromTMDB({
        ...BASE_FILTERS,
        genres: [genre],
        minRating: 6.5,
      })
      const filtered = movies.filter((m) => !excludedIds.has(m.id)).slice(0, 20)
      if (filtered.length > 0) {
        sections.push({
          id: `genre-${genre}`,
          title: `Because you like ${genre}`,
          movies: filtered,
        })
      }
    } catch (_) {
      // Network error — skip this section
    }
  }

  return sections
}
