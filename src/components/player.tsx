import { useCallback, useEffect, useState } from 'react'
import {
  Maximize2, Volume1, Volume2, VolumeX, ChevronDown, ListMusic, MoreHorizontal, Pause, Play, Repeat, Repeat1, Share2, Shuffle, SkipBack, SkipForward, Speaker, Heart, UserRound, ListPlus,
} from 'lucide-react'
import { Art, IconButton, Menu, PlaybackScrubber, Slider, Tooltip } from './index'

export type Track = {
  id: string; title: string; artist: string; source: string; duration: number; tone: 1 | 2 | 3 | 4; tint: string
  image?: string; placeholder?: string
}
export type RepeatMode = 'off' | 'all' | 'one'

/** Simulated playback clock + queue. Swap for a real audio engine later; components only read this shape. */
export function usePlayback(initialQueue: Track[]) {
  const [queue, setQueue] = useState(initialQueue)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [position, setPosition] = useState(0)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState<RepeatMode>('off')
  const [saved, setSaved] = useState<Set<string>>(() => new Set())
  const [volume, setVolumeState] = useState(80)
  const [muted, setMuted] = useState(false)
  const track = queue[index]

  const go = useCallback((i: number) => { setIndex((i + queue.length) % queue.length); setPosition(0) }, [queue.length])
  const next = useCallback(() => {
    if (shuffle && queue.length > 1) {
      let i = index
      while (i === index) i = Math.floor(Math.random() * queue.length)
      go(i)
    } else go(index + 1)
  }, [go, index, queue.length, shuffle])
  const prev = useCallback(() => (position > 3 ? setPosition(0) : go(index - 1)), [go, index, position])

  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setPosition((p) => {
        if (p + 1 < track.duration) return p + 1
        if (repeat === 'one') return 0
        if (repeat === 'off' && index === queue.length - 1) { setPlaying(false); return track.duration }
        queueMicrotask(next)
        return p
      })
    }, 1000)
    return () => clearInterval(t)
  }, [playing, track.duration, repeat, index, queue.length, next])

  type Snapshot = { queue: Track[]; index: number; position: number; playing: boolean; started: boolean }

  return {
    track, queue, playing, position, shuffle, repeat,
    /** False until something has been played: the mini player stays hidden until then. */
    started,
    playQueue: (q: Track[], i = 0) => { setQueue(q); setIndex(i); setPosition(0); setPlaying(true); setStarted(true) },
    /** For optimistic play: take a snapshot before acting, restore it if the stream fails. */
    snapshot: (): Snapshot => ({ queue, index, position, playing, started }),
    restore: (snap: Snapshot) => { setQueue(snap.queue); setIndex(snap.index); setPosition(snap.position); setPlaying(snap.playing); setStarted(snap.started) },
    saved: saved.has(track.id),
    volume, muted,
    setVolume: (v: number) => { setVolumeState(v); setMuted(v === 0) },
    toggleMute: () => setMuted((m) => !m),
    toggle: () => setPlaying((p) => !p),
    seek: setPosition,
    next, prev,
    toggleShuffle: () => setShuffle((s) => !s),
    cycleRepeat: () => setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')),
    toggleSave: () => setSaved((s) => { const n = new Set(s); if (n.has(track.id)) n.delete(track.id); else n.add(track.id); return n }),
  }
}

export type Playback = ReturnType<typeof usePlayback>

/** Collapsed player docked above the navigation bar. The whole bar opens the sheet; play/next act in place. */
export function MiniPlayer({ player, expanded, onExpand }: { player: Playback; expanded: boolean; onExpand: () => void }) {
  const { track, playing, position } = player
  return (
    <div className="ob-mini-player">
      <button
        className="ob-mini-player__open ob-interactive"
        aria-label={`Now playing: ${track.title} by ${track.artist}. Open player`}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        onClick={onExpand}
      />
      <span className="ob-mini-player__thumb"><Art tone={track.tone} src={track.image} placeholder={track.placeholder} /></span>
      <span className="ob-mini-player__text" aria-hidden>
        <span className="ob-title-sm ob-truncate">{track.title}</span>
        <span className="ob-label-sm ob-truncate">{track.artist}</span>
      </span>
      <span className="ob-mini-player__actions">
        <IconButton label={playing ? 'Pause' : 'Play'} onClick={player.toggle}>
          {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        </IconButton>
        <IconButton label="Next track" onClick={player.next}><SkipForward fill="currentColor" /></IconButton>
      </span>
      <span className="ob-mini-player__progress" aria-hidden>
        <span style={{ width: `${(position / track.duration) * 100}%` }} />
      </span>
    </div>
  )
}

/** Expanded player. Render inside <BottomSheet>. */
export function NowPlaying({ player, onCollapse }: { player: Playback; onCollapse: () => void }) {
  const { track, playing, shuffle, repeat, saved } = player
  return (
    <div className="ob-now">
      <header className="ob-now__header" data-sheet-drag>
        <IconButton label="Minimise player" onClick={onCollapse}><ChevronDown /></IconButton>
        <span className="ob-now__source">
          <span className="ob-label-sm">Playing from</span>
          <span className="ob-title-sm ob-truncate">{track.source}</span>
        </span>
        <Menu
          trigger={(p) => <IconButton label="More options" {...p}><MoreHorizontal /></IconButton>}
          items={[
            { label: 'Add to queue', icon: <ListPlus /> },
            { label: 'Go to artist', icon: <UserRound /> },
            { label: 'Share', icon: <Share2 /> },
          ]}
        />
      </header>

      <div className="ob-now__art" data-sheet-drag><Art tone={track.tone} src={track.image} placeholder={track.placeholder} /></div>

      <div className="ob-now__meta">
        <div className="ob-now__titles" aria-live="polite">
          <h2 className="ob-headline-sm ob-truncate">{track.title}</h2>
          <p className="ob-body-md ob-truncate">{track.artist}</p>
        </div>
        <IconButton label="Save to library" selected={saved} onClick={player.toggleSave}><Heart /></IconButton>
      </div>

      <PlaybackScrubber position={player.position} duration={track.duration} onSeek={player.seek} />

      <div className="ob-now__transport">
        <IconButton label="Shuffle" selected={shuffle} onClick={player.toggleShuffle} data-indicator><Shuffle /></IconButton>
        <IconButton label="Previous track" onClick={player.prev}><SkipBack fill="currentColor" /></IconButton>
        <IconButton label={playing ? 'Pause' : 'Play'} variant="filled" size="lg" onClick={player.toggle}>
          {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        </IconButton>
        <IconButton label="Next track" onClick={player.next}><SkipForward fill="currentColor" /></IconButton>
        <IconButton
          label={`Repeat: ${repeat === 'off' ? 'off' : repeat === 'all' ? 'all' : 'this track'}`}
          selected={repeat !== 'off'}
          onClick={player.cycleRepeat}
          data-indicator
        >
          {repeat === 'one' ? <Repeat1 /> : <Repeat />}
        </IconButton>
      </div>

      <footer className="ob-now__footer">
        <button className="ob-now__device ob-interactive"><Speaker />This phone</button>
        <span className="ob-now__footer-actions">
          <IconButton label="Queue"><ListMusic /></IconButton>
          <IconButton label="Share"><Share2 /></IconButton>
        </span>
      </footer>
    </div>
  )
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/**
 * Docked player for expanded and up (≥840px). It rests on the page edge, so it uses
 * tone and a top rule rather than a shadow. Title and art cross-fade on track change.
 */
export function PlayerBar({ player, onExpand, expanded }: { player: Playback; onExpand: () => void; expanded: boolean }) {
  const { track, playing, position, shuffle, repeat, saved, volume, muted } = player
  const level = muted ? 0 : volume
  const repeatLabel = `Repeat: ${repeat === 'off' ? 'off' : repeat === 'all' ? 'all' : 'this track'}`
  return (
    <section className="ob-player-bar" aria-label="Player">
      <div className="ob-player-bar__now">
        <span className="ob-player-bar__art" key={`art-${track.id}`}>
          <Art tone={track.tone} src={track.image} placeholder={track.placeholder} />
        </span>
        <span className="ob-player-bar__text" key={`text-${track.id}`} aria-live="polite">
          <span className="ob-title-sm ob-truncate">{track.title}</span>
          <span className="ob-label-sm ob-truncate">{track.artist}</span>
        </span>
        <IconButton label="Save to library" selected={saved} onClick={player.toggleSave}><Heart /></IconButton>
      </div>

      <div className="ob-player-bar__center">
        <div className="ob-player-bar__transport">
          <Tooltip text={shuffle ? 'Shuffle on' : 'Shuffle'}>
            <IconButton label="Shuffle" selected={shuffle} onClick={player.toggleShuffle} data-indicator><Shuffle /></IconButton>
          </Tooltip>
          <IconButton label="Previous track" onClick={player.prev}><SkipBack fill="currentColor" /></IconButton>
          <IconButton label={playing ? 'Pause' : 'Play'} variant="filled" onClick={player.toggle}>
            {playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
          </IconButton>
          <IconButton label="Next track" onClick={player.next}><SkipForward fill="currentColor" /></IconButton>
          <Tooltip text={repeatLabel}>
            <IconButton label={repeatLabel} selected={repeat !== 'off'} onClick={player.cycleRepeat} data-indicator>
              {repeat === 'one' ? <Repeat1 /> : <Repeat />}
            </IconButton>
          </Tooltip>
        </div>
        <div className="ob-player-bar__seek">
          <span>{clock(position)}</span>
          <Slider label="Seek" value={position} max={track.duration} onChange={player.seek} aria-valuetext={`${clock(position)} of ${clock(track.duration)}`} />
          <span>{clock(track.duration)}</span>
        </div>
      </div>

      <div className="ob-player-bar__extras">
        <span className="ob-player-bar__optional">
          <Tooltip text="Queue"><IconButton label="Queue"><ListMusic /></IconButton></Tooltip>
          <Tooltip text="Connect to a device"><IconButton label="Connect to a device"><Speaker /></IconButton></Tooltip>
        </span>
        <IconButton label={muted ? 'Unmute' : 'Mute'} onClick={player.toggleMute}>
          {level === 0 ? <VolumeX /> : level < 50 ? <Volume1 /> : <Volume2 />}
        </IconButton>
        <span className="ob-player-bar__volume"><Slider label="Volume" value={level} onChange={player.setVolume} /></span>
        <Tooltip text="Open player">
          <IconButton label="Open player" aria-haspopup="dialog" aria-expanded={expanded} onClick={onExpand}><Maximize2 /></IconButton>
        </Tooltip>
      </div>
    </section>
  )
}
