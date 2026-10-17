import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Bell, BookOpen, Clock, ListMusic, Music, TrendingUp, X } from 'lucide-react'
import { Avatar, IconButton, SearchField, type Track } from '../components'
import { api } from './api'
import { notifications, search, trending, type SearchHit, type Story } from './data'

const RECENT_KEY = 'offbeat:recent-searches'
const readRecent = (): SearchHit[] => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] } }
const writeRecent = (hits: SearchHit[]) => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(hits)) } catch { /* private mode: recents just don't persist */ } }

const kindIcon = { track: <Music />, mix: <ListMusic />, story: <BookOpen /> }

export function TopBar({ onSearchOpenChange, onPlay, onOpenStory, onToast }: {
  onSearchOpenChange: (open: boolean) => void
  onPlay: (queue: Track[], index?: number) => void
  onOpenStory: (s: Story) => void
  onToast: (t: { message: string }) => void
}) {
  return (
    <div className="topbar">
      <SearchBox onOpenChange={onSearchOpenChange} onPlay={onPlay} onOpenStory={onOpenStory} />
      <div className="topbar__actions">
        <Notifications onToast={onToast} />
        <Avatar name="Misugla" src="./media/avatar.webp" />
      </div>
    </div>
  )
}

function SearchBox({ onOpenChange, onPlay, onOpenStory }: {
  onOpenChange: (open: boolean) => void
  onPlay: (queue: Track[], index?: number) => void
  onOpenStory: (s: Story) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpenState] = useState(false)
  const [active, setActive] = useState(-1)
  const [recent, setRecent] = useState<SearchHit[]>(readRecent)
  const input = useRef<HTMLInputElement>(null)
  const listId = useId()

  const setOpen = (v: boolean) => { setOpenState(v); onOpenChange(v) }
  const hits = query ? search(query) : recent
  const optionId = (i: number) => `${listId}-opt-${i}`

  const choose = (hit: SearchHit) => {
    const next = [hit, ...recent.filter((r) => r.id !== hit.id)].slice(0, 5)
    setRecent(next)
    writeRecent(next)
    setQuery('')
    setOpen(false)
    input.current?.blur()
    if (hit.kind === 'track') onPlay([hit.track])
    else if (hit.kind === 'mix') onPlay(hit.mix.tracks)
    else onOpenStory(hit.story)
  }

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)) }
    else if (e.key === 'Enter' && hits[Math.max(active, 0)]) { e.preventDefault(); choose(hits[Math.max(active, 0)]) }
    else if (e.key === 'Escape') { setOpen(false); input.current?.blur() }
  }

  return (
    <div className="search" data-open={open || undefined}>
      <SearchField
        ref={input}
        placeholder="Search music, artist, culture..."
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? optionId(active) : undefined}
        onChange={(e) => { setQuery(e.target.value); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {open && (
        // preventDefault on mousedown keeps focus in the input, so a click can land before blur closes the panel.
        <div className="search__panel" onMouseDown={(e) => e.preventDefault()}>
          {!query && recent.length > 0 && (
            <div className="search__head">
              <span className="ob-label-sm">Recent</span>
              <button className="ob-link" onClick={() => { setRecent([]); writeRecent([]) }}>Clear</button>
            </div>
          )}
          <ul className="search__list" role="listbox" id={listId} aria-label={query ? 'Results' : 'Recent searches'}>
            {hits.map((h, i) => (
              <li
                key={h.kind + h.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className="search__option"
                onClick={() => choose(h)}
                onPointerMove={() => setActive(i)}
              >
                <span className="search__icon">{query ? kindIcon[h.kind] : <Clock />}</span>
                <span className="search__text">
                  <span className="ob-body-md search__title">{h.title}</span>
                  <span className="ob-label-sm">{h.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          {query && hits.length === 0 && <p className="ob-body-md search__empty">No matches for "{query}". Try an artist or a mood.</p>}
          {!query && (
            <div className="search__trending">
              <span className="ob-label-sm"><TrendingUp /> Trending</span>
              <div className="ob-chip-group">
                {trending.map((t) => <button key={t} className="ob-chip ob-interactive" onClick={() => setQuery(t)}>{t}</button>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Notifications({ onToast }: { onToast: (t: { message: string }) => void }) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(notifications.length)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close) }
  }, [open])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next && unread) {
      // Optimistic: the badge clears now; restore it if the server disagrees.
      const before = unread
      setUnread(0)
      api.markRead().catch(() => { setUnread(before); onToast({ message: "Couldn't mark notifications as read" }) })
    }
  }

  return (
    <div className="notif" ref={root}>
      <IconButton label="Notifications" variant="tonal" badge={unread > 0 ? true : undefined} aria-expanded={open} aria-haspopup="dialog" onClick={toggle}>
        <Bell />
      </IconButton>
      {open && (
        <div className="notif__panel" role="dialog" aria-label="Notifications">
          <div className="notif__head">
            <h2 className="ob-title-md">Notifications</h2>
            <IconButton label="Close notifications" onClick={() => setOpen(false)}><X /></IconButton>
          </div>
          <ul className="ob-list">
            {notifications.map((n) => (
              <li key={n.id} className="notif__item">
                <span className="ob-body-md notif__title">{n.title}</span>
                <span className="ob-label-sm">{n.detail} · {n.when}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
