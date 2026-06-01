import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase.js'

function rowToItem(row) {
  return {
    ...row.movie_data,
    id: row.movie_id,
    queueWatched: row.queue_watched,
    ratingSource: row.rating_source,
    savedAt: new Date(row.saved_at).getTime(),
    // If the in_queue column doesn't exist yet, fall back to !queue_watched
    inQueue: row.in_queue !== undefined && row.in_queue !== null
      ? row.in_queue
      : !row.queue_watched,
  }
}

export function useWatchQueue(userId) {
  const [allItems, setAllItems] = useState([])
  const [loadingQueue, setLoadingQueue] = useState(true)

  // Derived views
  const queue          = useMemo(() => allItems.filter((m) => m.inQueue),       [allItems])
  const watchedHistory = useMemo(() => allItems.filter((m) => m.queueWatched),  [allItems])

  useEffect(() => {
    if (!userId) {
      setAllItems([])
      setLoadingQueue(false)
      return
    }

    let cancelled = false
    setLoadingQueue(true)

    // Load all rows for this user — we filter client-side so the query works
    // even if the in_queue column hasn't been added to the DB yet.
    supabase
      .from('watch_queue')
      .select('*')
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
      if (existing.inQueue) return // already in queue
      setAllItems((prev) => prev.map((m) => m.id === movie.id ? { ...m, inQueue: true } : m))

      // Try updating in_queue column; if it doesn't exist, the row stays but
      // inQueue is tracked only in local state until the column is added.
      await supabase
        .from('watch_queue')
        .update({ in_queue: true })
        .eq('user_id', userId)
        .eq('movie_id', movie.id)
      // Intentionally ignore error — column may not exist yet; optimistic state is fine
    } else {
      const optimistic = { ...movie, queueWatched: false, inQueue: true, savedAt: Date.now(), ratingSource }
      setAllItems((prev) => [optimistic, ...prev])

      // Build the insert payload without in_queue so the insert succeeds even
      // when the column hasn't been added.  If the column exists with DEFAULT true
      // it will automatically receive the correct value.
      const { error } = await supabase.from('watch_queue').insert({
        user_id: userId,
        movie_id: movie.id,
        movie_data: movie,
        queue_watched: false,
        rating_source: ratingSource,
      })

      if (error) {
        setAllItems((prev) => prev.filter((m) => m.id !== movie.id))
      }
    }
  }

  // ── removeFromQueue ─────────────────────────────────────────────────────────
  async function removeFromQueue(movieId) {
    const item = allItems.find((m) => m.id === movieId)
    if (!item || !item.inQueue) return

    if (item.queueWatched) {
      // Soft remove — keep row for watch history by setting in_queue = false
      setAllItems((prev) => prev.map((m) => m.id === movieId ? { ...m, inQueue: false } : m))

      const { error } = await supabase
        .from('watch_queue')
        .update({ in_queue: false })
        .eq('user_id', userId)
        .eq('movie_id', movieId)

      if (error) {
        // in_queue column likely missing — fall back to hard delete.
        // The watched history entry is lost, but this is graceful degradation.
        setAllItems((prev) => prev.filter((m) => m.id !== movieId))
        await supabase
          .from('watch_queue')
          .delete()
          .eq('user_id', userId)
          .eq('movie_id', movieId)
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
