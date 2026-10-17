import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { BookOpen, Headphones, Heart, Home, Music, Radio, Search } from 'lucide-react'
import {
  BottomSheet, MiniPlayer, PlayerBar, NavigationBar, NavigationRail, NavItem, NavLabel, NowPlaying, Snackbar, usePlayback,
  type Destination, type Track,
} from '../components'
import { api } from './api'
import { onRepeat, radio, type Story } from './data'
import { Discover } from './Discover'
import { StoryView } from './StoryView'
import { TopBar } from './TopBar'
import { RightRail } from './RightRail'
import './app.css'

type Route = { name: 'discover' } | { name: 'story'; story: Story }

const sidebar: [string, ReactNode][] = [['Discover', <Search />], ['Saved', <Heart />], ['Music', <Music />], ['Culture', <BookOpen />]]
const frequency: [string, ReactNode][] = [['Playlist', <Headphones />], ['Offbeat radio', <Radio />]]
const destinations: Destination[] = [
  { key: 'Discover', label: 'Discover', icon: <Home /> },
  { key: 'Music', label: 'Music', icon: <Music /> },
  { key: 'Culture', label: 'Culture', icon: <BookOpen /> },
  { key: 'Saved', label: 'Saved', icon: <Heart /> },
]

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Run a state change inside a view transition when supported, so shared elements morph. */
function transition(update: () => void) {
  if (!document.startViewTransition || reducedMotion()) { update(); return }
  document.startViewTransition(() => flushSync(update))
}

export function App() {
  const [route, setRoute] = useState<Route>({ name: 'discover' })
  const [nav, setNav] = useState('Discover')
  const [sheet, setSheet] = useState(false)
  const [toast, setToast] = useState<{ message: string; action?: string; onAction?: () => void } | null>(null)
  const [searching, setSearching] = useState(false)
  const player = usePlayback(onRepeat)
  const closeToast = useCallback(() => setToast(null), [])
  const scroller = useRef<HTMLDivElement>(null)
  const discoverScroll = useRef(0)
  const returning = useRef(false)

  // Coming back from a story: put focus back on the CTA that opened it.
  useEffect(() => {
    if (route.name !== 'discover' || !returning.current) return
    returning.current = false
    document.querySelector<HTMLElement>('.ob-feature .ob-button')?.focus({ preventScroll: true })
  }, [route.name])

  /* ─── Routing: hash-based so Back works; the morph runs both ways ─── */
  const openStory = useCallback((story: Story) => {
    discoverScroll.current = scroller.current?.scrollTop ?? 0
    transition(() => {
      setRoute({ name: 'story', story })
      scroller.current?.scrollTo({ top: 0 })
    })
    history.pushState({ story: story.id }, '', `#/story/${story.id}`)
  }, [])

  useEffect(() => {
    const onPop = () => {
      if (location.hash.startsWith('#/story/')) return
      returning.current = true
      transition(() => {
        setRoute({ name: 'discover' })
        scroller.current?.scrollTo({ top: discoverScroll.current })
      })
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  // Deep link to a story on first load.
  useEffect(() => {
    const id = location.hash.match(/^#\/story\/(.+)$/)?.[1]
    if (id) api.story(id).then((story) => setRoute({ name: 'story', story }), () => history.replaceState(null, '', location.pathname))
  }, [])

  /* ─── Optimistic playback: the UI plays now, the stream catches up, failures roll back ─── */
  const play = useCallback((queue: Track[], index = 0) => {
    const snap = player.snapshot()
    player.playQueue(queue, index)
    api.startStream(queue[index]).catch(() => {
      player.restore(snap)
      setToast({ message: `Couldn't play "${queue[index].title}"`, action: 'Retry', onAction: () => play(queue, index) })
    })
  }, [player])

  const radioLive = player.started && player.playing && player.track.source === 'Offbeat radio'

  /* ─── Desktop affordances: OS media keys / lock screen, and Space to play-pause ─── */
  const { track, playing, started } = player
  const controls = useRef(player)
  controls.current = player
  useEffect(() => {
    if (!started || !('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.source,
      artwork: track.image ? [{ src: new URL(track.image, location.href).href, sizes: '334x277', type: 'image/webp' }] : [],
    })
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
  }, [started, track, playing])
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const set = (a: MediaSessionAction, fn: () => void) => { try { navigator.mediaSession.setActionHandler(a, fn) } catch { /* unsupported action */ } }
    set('play', () => { if (!controls.current.playing) controls.current.toggle() })
    set('pause', () => { if (controls.current.playing) controls.current.toggle() })
    set('nexttrack', () => controls.current.next())
    set('previoustrack', () => controls.current.prev())
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || !controls.current.started) return
      // Space keeps its normal meaning on anything interactive, and inside the sheet.
      if ((e.target as Element).closest('input, textarea, button, a, [role="slider"], [role="option"], [contenteditable], dialog, [role="dialog"]')) return
      e.preventDefault()
      controls.current.toggle()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="app ob-sheet-host" data-searching={searching || undefined} data-player={player.started || undefined}>
      <div className="app__scroll" ref={scroller}>
        <div className="app__layout">
          <aside className="app__sidebar">
            <nav className="ob-nav" aria-label="Primary">
              {sidebar.map(([l, i]) => <NavItem key={l} icon={i} active={nav === l} onClick={() => setNav(l)}>{l}</NavItem>)}
            </nav>
            <NavLabel>On your frequency</NavLabel>
            <nav className="ob-nav" aria-label="Your frequency">
              {frequency.map(([l, i]) => <NavItem key={l} icon={i} active={nav === l} onClick={() => setNav(l)}>{l}</NavItem>)}
            </nav>
          </aside>
          <div className="app__rail"><NavigationRail items={destinations} value={nav} onChange={setNav} /></div>

          <main className="app__main">
            <TopBar onSearchOpenChange={setSearching} onPlay={play} onOpenStory={openStory} onToast={setToast} />
            <div className="app__content">
              {route.name === 'discover'
                ? <Discover onOpenStory={openStory} onPlay={play} nowSource={player.started ? player.track.source : undefined} playing={player.playing} />
                : <StoryView story={route.story} onBack={() => history.back()} />}
            </div>
          </main>

          <RightRail
            radioLive={radioLive}
            onTuneIn={() => (radioLive ? player.toggle() : play(radio))}
            onPlayTrack={(i) => play(onRepeat, i)}
            currentId={player.started && player.track.source === 'On repeat' ? player.track.id : undefined}
            playing={player.playing}
          />
        </div>
        <div className="app__navbar"><NavigationBar items={destinations} value={nav} onChange={setNav} /></div>
      </div>

      {player.started && (
        <>
          <div className="app__player">
            <MiniPlayer player={player} expanded={sheet} onExpand={() => setSheet(true)} />
          </div>
          <div className="app__dock">
            <PlayerBar player={player} expanded={sheet} onExpand={() => setSheet(true)} />
          </div>
        </>
      )}

      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        label="Now playing"
        className="ob-player-sheet"
        style={{ ['--sheet-tint' as string]: player.track.tint }}
      >
        <NowPlaying player={player} onCollapse={() => setSheet(false)} />
      </BottomSheet>

      {toast && <Snackbar key={toast.message} message={toast.message} action={toast.action} onAction={toast.onAction} onClose={closeToast} />}
    </div>
  )
}
