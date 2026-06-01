import { useState, useEffect } from 'react'

const STORAGE_KEY = 'movie-picker-queue'

function loadQueue() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useWatchQueue() {
  const [queue, setQueue] = useState(loadQueue)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
    } catch {
      // localStorage unavailable — degrade silently
    }
  }, [queue])

  function addToQueue(movie, ratingSource = 'imdb') {
    setQueue((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev
      return [...prev, { ...movie, queueWatched: false, savedAt: Date.now(), ratingSource }]
    })
  }

  function removeFromQueue(movieId) {
    setQueue((prev) => prev.filter((m) => m.id !== movieId))
  }

  function isInQueue(movieId) {
    return queue.some((m) => m.id === movieId)
  }

  function toggleWatched(movieId) {
    setQueue((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, queueWatched: !m.queueWatched } : m))
    )
  }

  return { queue, addToQueue, removeFromQueue, isInQueue, toggleWatched }
}
