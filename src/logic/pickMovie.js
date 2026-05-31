export function pickMovie(filteredMovies) {
  if (!filteredMovies || filteredMovies.length === 0) return null
  const index = Math.floor(Math.random() * filteredMovies.length)
  return filteredMovies[index]
}
