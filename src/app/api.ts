import { useEffect, useState } from 'react'
import { feeds, notifications, onRepeat, type Feed, type Filter, type Notification, type Story } from './data'
import type { Track } from '../components'

/* Mock network. Latency is real (jittered); `?chaos` makes half of all stream starts fail. */

const chaos = new URLSearchParams(location.search).has('chaos')
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms + Math.random() * ms * 0.4))

const inflight = new Map<string, Promise<unknown>>()
const settled = new Map<string, unknown>()

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!inflight.has(key)) {
    inflight.set(key, load().then(
      (v) => { settled.set(key, v); return v },
      (e) => { inflight.delete(key); throw e },
    ))
  }
  return inflight.get(key) as Promise<T>
}

export const api = {
  feed: (f: Filter) => cached(`feed:${f}`, async () => { await wait(f === 'For you' ? 900 : 650); return feeds[f] }),
  onRepeat: () => cached('repeat', async () => { await wait(600); return onRepeat }),
  story: (id: string) => cached(`story:${id}`, async () => {
    await wait(700)
    const s = Object.values(feeds).find((x) => x.story.id === id)?.story
    if (!s) throw new Error('Story not found')
    return s
  }),
  notifications: () => cached('notifications', async () => { await wait(300); return notifications }),
  markRead: async () => { await wait(400) },
  /** Resolves when the stream is buffering; the UI never waits for this. */
  startStream: async (track: Track) => {
    await wait(350)
    if (chaos && Math.random() < 0.5) throw new Error(`Stream failed for ${track.id}`)
  },
}

/** Synchronous read of anything already fetched: lets cached content render on the same frame. */
export const peek = <T,>(key: string) => settled.get(key) as T | undefined
export const keys = { feed: (f: Filter) => `feed:${f}`, repeat: 'repeat', story: (id: string) => `story:${id}` }

export type Resource<T> = { data?: T; error?: Error; fresh: boolean; skeleton: boolean; dimmed: boolean; retry: () => void }

/**
 * Stale-while-revalidate with a perception budget:
 * cached → render instantly; uncached → keep the old content dimmed for 250ms,
 * and only then fall back to skeletons. Most prefetched loads never show a skeleton.
 */
export function useResource<T>(key: string, load: () => Promise<T>): Resource<T> {
  const [state, setState] = useState<{ key: string; data?: T; error?: Error }>(() => ({ key, data: peek<T>(key) }))
  const [slow, setSlow] = useState(false)
  const [attempt, setAttempt] = useState(0)

  const hit = peek<T>(key)
  if (hit !== undefined && state.key !== key) setState({ key, data: hit })
  // Use the cache hit in this same render too, so a cached switch never reads as stale, even for one pass.
  const current = hit !== undefined && state.key !== key ? { key, data: hit } : state

  useEffect(() => {
    if (peek(key) !== undefined) return
    let live = true
    const timer = setTimeout(() => live && setSlow(true), 250)
    load().then(
      (data) => { if (live) { setState({ key, data }); setSlow(false) } },
      (error: Error) => { if (live) { setState((s) => ({ ...s, key, error })); setSlow(false) } },
    )
    return () => { live = false; clearTimeout(timer); setSlow(false) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const fresh = current.key === key
  return {
    data: current.data,
    error: fresh ? state.error : undefined,
    fresh,
    skeleton: current.data === undefined || (!fresh && slow),
    dimmed: !fresh && !slow && current.data !== undefined,
    retry: () => { setState((s) => ({ ...s, error: undefined })); setAttempt((a) => a + 1) },
  }
}

export type { Feed, Story, Notification }
