export function filterMovies(movies, filters) {
  const {
    searchScope,
    selectedServices,
    includeTVAiring,
    moods,
    ratingSource,
    minRating,
    yearFrom,
    yearTo,
    runtime,
    genres,
    keywords,
    hideWatched,
  } = filters

  return movies.filter((movie) => {
    if (hideWatched && movie.watched) return false

    if (!includeTVAiring && movie.tvAiring) return false

    if (searchScope === 'myServices' && selectedServices.length > 0) {
      const hasService = movie.services.some((s) => selectedServices.includes(s))
      if (!hasService) return false
    }

    if (moods.length > 0) {
      const moodMatch = moods.some((m) => movie.moods.includes(m))
      if (!moodMatch) return false
    }

    const rating = ratingSource === 'imdb' ? movie.ratingIMDb : movie.ratingFilmweb
    if (rating < minRating) return false

    if (movie.year < yearFrom || movie.year > yearTo) return false

    if (runtime === '<90' && movie.runtime >= 90) return false
    if (runtime === '90-120' && (movie.runtime < 90 || movie.runtime > 120)) return false

    if (genres.length > 0) {
      const genreMatch = genres.some((g) => movie.genres.includes(g))
      if (!genreMatch) return false
    }

    if (keywords.trim()) {
      const q = keywords.trim().toLowerCase()
      const searchable = [
        movie.title,
        movie.description,
        ...movie.keywords,
      ].join(' ').toLowerCase()
      if (!searchable.includes(q)) return false
    }

    return true
  })
}
