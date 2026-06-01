import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'

function rowToItem(row) {
  return {
    ...row.movie_data,
    id: row.movie_id,
    queueWatched: row.queue_watched,
    ratingSource: row.rating_source,
    savedAt: new Date(row.saved_at).getTime(),
  }
}

export function useWatchQueue(userId) {
  const [queue, setQueue] = useState([])
  const [loadingQueue, setLoadingQueue] = useState(true)

  // Load queue from Supabase on mount / user change
  useEffect(() => {
    if (!userId) {
      setQueue([])
      setLoadingQueue(false)
      return
    }

    let cancelled = false
    setLoadingQueue(true)

    supabase
      .from('watch_queue')
      .select('*')
      .order('saved_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setQueue(data.map(rowToItem))
        setLoadingQueue(false)
      })

    return () => { cancelled = true }
  }, [userId])

  async function addToQueue(movie, ratingSource = 'imdb') {
    if (!userId || queue.some((m) => m.id === movie.id)) return

    // Optimistic update
    const optimistic = { ...movie, queueWatched: false, savedAt: Date.now(), ratingSource }
    setQueue((prev) => [optimistic, ...prev])

    const { error } = await supabase.from('watch_queue').insert({
      user_id: userId,
      movie_id: movie.id,
      movie_data: movie,
      queue_watched: false,
      rating_source: ratingSource,
    })

    if (error) {
      // Roll back
      setQueue((prev) => prev.filter((m) => m.id !== movie.id))
    }
  }

  async function removeFromQueue(movieId) {
    const snapshot = queue.find((m) => m.id === movieId)
    setQueue((prev) => prev.filter((m) => m.id !== movieId)) // optimistic

    const { error } = await supabase
      .from('watch_queue')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId)

    if (error && snapshot) {
      setQueue((prev) => [...prev, snapshot]) // roll back
    }
  }

  function isInQueue(movieId) {
    return queue.some((m) => m.id === movieId)
  }

  async function toggleWatched(movieId) {
    const item = queue.find((m) => m.id === movieId)
    if (!item) return

    const newWatched = !item.queueWatched
    setQueue((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, queueWatched: newWatched } : m))
    ) // optimistic

    const { error } = await supabase
      .from('watch_queue')
      .update({ queue_watched: newWatched })
      .eq('user_id', userId)
      .eq('movie_id', movieId)

    if (error) {
      setQueue((prev) =>
        prev.map((m) => (m.id === movieId ? { ...m, queueWatched: item.queueWatched } : m))
      ) // roll back
    }
  }

  return { queue, loadingQueue, addToQueue, removeFromQueue, isInQueue, toggleWatched }
}
