import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase.js'

function rowToItem(row) {
  return {
    ...row.movie_data,
    id: row.movie_id,
    queueWatched: row.queue_watched,
    ratingSource: row.rating_source,
    savedAt: new Date(row.saved_at).getTime(),
    inQueue: row.in_queue,
  }
}

export function useWatchQueue(userId) {
  // allItems holds every relevant row: in_queue OR queue_watched (or both)
  const [allItems, setAllItems] = useState([])
  const [loadingQueue, setLoadingQueue] = useState(true)

  // Derived views — no extra state, just filtered views of allItems
  const queue          = useMemo(() => allItems.filter((m) => m.inQueue),       [allItems])
  const watchedHistory = useMemo(() => allItems.filter((m) => m.queueWatched),  [allItems])

  // Load on mount / user change
  useEffect(() => {
    if (!userId) {
      setAllItems([])
      setLoadingQueue(false)
      return
    }

    let cancelled = false
    setLoadingQueue(true)

    supabase
      .from('watch_queue')
      .select('*')
      // fetch rows that are in the queue OR have been watched (or both)
      .or('in_queue.eq.true,queue_watched.eq.true')
      .order('saved_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setAllItems(data.map(rowToItem))
        setLoadingQueue(false)
      })

    return () => { cancelled = true }
  }, [userId])

  // ── addToQueue ──────────────────────────────────────────────────────────────
  async function addToQueue(movie, ratingSource = 'imdb') {
    if (!userId) return

    const existing = allItems.find((m) => m.id === movie.id)

    if (existing) {
      // Already in allItems (may have been soft-removed). Just flip in_queue on.
      if (existing.inQueue) return // already in queue, nothing to do
      setAllItems((prev) => prev.map((m) => m.id === movie.id ? { ...m, inQueue: true } : m))

      const { error } = await supabase
        .from('watch_queue')
        .update({ in_queue: true })
        .eq('user_id', userId)
        .eq('movie_id', movie.id)

      if (error) {
        setAllItems((prev) => prev.map((m) => m.id === movie.id ? { ...m, inQueue: false } : m))
      }
    } else {
      // Brand new item
      const optimistic = { ...movie, queueWatched: false, inQueue: true, savedAt: Date.now(), ratingSource }
      setAllItems((prev) => [optimistic, ...prev])

      const { error } = await supabase.from('watch_queue').insert({
        user_id: userId,
        movie_id: movie.id,
        movie_data: movie,
        queue_watched: false,
        in_queue: true,
        rating_source: ratingSource,
      })

      if (error) {
        setAllItems((prev) => prev.filter((m) => m.id !== movie.id))
      }
    }
  }

  // ── removeFromQueue ─────────────────────────────────────────────────────────
  // Watched movies: soft-delete (in_queue = false) → stay in watchedHistory
  // Unwatched movies: hard-delete → gone completely
  async function removeFromQueue(movieId) {
    const item = allItems.find((m) => m.id === movieId)
    if (!item || !item.inQueue) return

    if (item.queueWatched) {
      // Soft remove — keep row for history
      setAllItems((prev) => prev.map((m) => m.id === movieId ? { ...m, inQueue: false } : m))

      const { error } = await supabase
        .from('watch_queue')
        .update({ in_queue: false })
        .eq('user_id', userId)
        .eq('movie_id', movieId)

      if (error) {
        setAllItems((prev) => prev.map((m) => m.id === movieId ? { ...m, inQueue: true } : m))
      }
    } else {
      // Hard remove — no watch history to preserve
      setAllItems((prev) => prev.filter((m) => m.id !== movieId))

      const { error } = await supabase
        .from('watch_queue')
        .delete()
        .eq('user_id', userId)
        .eq('movie_id', movieId)

      if (error) {
        setAllItems((prev) => [...prev, item])
      }
    }
  }

  // ── isInQueue ───────────────────────────────────────────────────────────────
  function isInQueue(movieId) {
    return allItems.some((m) => m.id === movieId && m.inQueue)
  }

  // ── toggleWatched ───────────────────────────────────────────────────────────
  async function toggleWatched(movieId) {
    const item = allItems.find((m) => m.id === movieId)
    if (!item) return

    const newWatched = !item.queueWatched
    setAllItems((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, queueWatched: newWatched } : m))
    )

    const { error } = await supabase
      .from('watch_queue')
      .update({ queue_watched: newWatched })
      .eq('user_id', userId)
      .eq('movie_id', movieId)

    if (error) {
      setAllItems((prev) =>
        prev.map((m) => (m.id === movieId ? { ...m, queueWatched: item.queueWatched } : m))
      )
    }
  }

  return { queue, watchedHistory, loadingQueue, addToQueue, removeFromQueue, isInQueue, toggleWatched }
}
