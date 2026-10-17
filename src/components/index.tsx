import {
  cloneElement, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type ComponentPropsWithRef,
  type ButtonHTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode,
} from 'react'
import { ArrowUpRight, Search as SearchIcon } from 'lucide-react'
import './styles.css'

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

/* ─────────── Media ─────────── */

type Tone = 1 | 2 | 3 | 4

/**
 * Artwork. With `src`, the image fades in over a blurred `placeholder` (a ~16px data URI)
 * so the layout never shows an empty box. Cached images skip the fade.
 */
export function Art({ tone = 1, src, alt = '', placeholder, priority, focus }: {
  tone?: Tone; src?: string; alt?: string; placeholder?: string; priority?: boolean
  /** Focal point as a CSS object-position (e.g. "60% 10%"), so any crop keeps the subject in frame. */
  focus?: string
}) {
  const [loaded, setLoaded] = useState(false)
  if (!src) return <span className="ob-art" data-tone={tone} role="presentation" />
  return (
    <span className="ob-art ob-art--photo" data-loaded={loaded || undefined}>
      {placeholder && <span className="ob-art__placeholder" style={{ backgroundImage: `url(${placeholder})`, backgroundPosition: focus }} aria-hidden />}
      <img
        ref={(img) => { if (img?.complete && img.naturalWidth) setLoaded(true) }}
        src={src}
        alt={alt}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        style={focus ? { objectPosition: focus } : undefined}
      />
    </span>
  )
}

/** Three-bar "now playing" indicator. Freezes when paused or under reduced motion. */
export function Equalizer({ playing }: { playing: boolean }) {
  return <span className="ob-eq" data-playing={playing || undefined} aria-hidden><span /><span /><span /></span>
}

export function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) return <img className="ob-avatar" src={src} alt={name} />
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('')
  return <span className="ob-avatar" role="img" aria-label={name}>{initials}</span>
}

/* ─────────── Actions ─────────── */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'inverse'
  leadingIcon?: ReactNode
  /** Arrow by default on filled/inverse: Offbeat CTAs point outward. Pass false to drop it. */
  trailingIcon?: ReactNode | false
  block?: boolean
}

export function Button({ variant = 'filled', leadingIcon, trailingIcon, block, children, className, ...rest }: ButtonProps) {
  const defaultTrail = variant === 'filled' || variant === 'inverse' ? <ArrowUpRight strokeWidth={2} /> : null
  const trail = trailingIcon === false ? null : (trailingIcon ?? defaultTrail)
  return (
    <button className={cx('ob-button ob-interactive ob-target', className)} data-variant={variant} data-block={block || undefined} {...rest}>
      {leadingIcon}
      <span>{children}</span>
      {trail && <span className="ob-button__trail">{trail}</span>}
    </button>
  )
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  variant?: 'standard' | 'filled' | 'tonal' | 'outlined'
  /** Makes it a toggle (e.g. save). */
  selected?: boolean
  badge?: boolean | number
  /** lg = 64px, for the primary transport control. */
  size?: 'md' | 'lg'
  children: ReactNode
}

export function IconButton({ label, variant = 'standard', selected, badge, size, children, className, ...rest }: IconButtonProps) {
  return (
    <button
      className={cx('ob-icon-button ob-interactive ob-target', className)}
      data-variant={variant}
      data-size={size === 'lg' ? 'lg' : undefined}
      aria-label={badge && typeof badge === 'number' ? `${label}, ${badge} new` : label}
      aria-pressed={selected}
      {...rest}
    >
      {children}
      {badge !== undefined && badge !== false && <Badge count={typeof badge === 'number' ? badge : undefined} />}
    </button>
  )
}

/** Small dot, or a count capped at 99+. Positioned by its parent. */
export function Badge({ count }: { count?: number }) {
  if (count === undefined) return <span className="ob-badge" aria-hidden />
  return <span className="ob-badge" data-count aria-hidden>{count > 99 ? '99+' : count}</span>
}

/* ─────────── Selection ─────────── */

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; icon?: ReactNode }

export function Chip({ selected = false, icon, children, className, ...rest }: ChipProps) {
  return (
    <button className={cx('ob-chip ob-interactive ob-target', className)} aria-pressed={selected} {...rest}>
      {selected && icon}
      {children}
    </button>
  )
}

export function Checkbox({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="ob-select">
      <span className="ob-select__target"><input type="checkbox" {...rest} /></span>
      {label}
    </label>
  )
}

export function Radio({ label, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="ob-select">
      <span className="ob-select__target"><input type="radio" {...rest} /></span>
      {label}
    </label>
  )
}

export function Switch({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  const id = useId()
  return (
    <div className="ob-switch-row">
      <span id={id}>{label}</span>
      <button role="switch" className="ob-switch ob-target" aria-checked={checked} aria-labelledby={id} disabled={disabled} onClick={() => onChange(!checked)}>
        <span className="ob-switch__handle" />
      </button>
    </div>
  )
}

export function Slider({ value, onChange, min = 0, max = 100, label, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  value: number; onChange: (v: number) => void; label: string
}) {
  const fill = ((value - Number(min)) / (Number(max) - Number(min))) * 100
  return (
    <input
      type="range"
      className="ob-slider"
      aria-label={label}
      min={min}
      max={max}
      value={value}
      style={{ ['--fill' as string]: `${fill}%` }}
      onChange={(e) => onChange(Number(e.target.value))}
      {...rest}
    />
  )
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Scrubber pattern: slider + elapsed/remaining times. */
export function PlaybackScrubber({ position, duration, onSeek }: { position: number; duration: number; onSeek: (s: number) => void }) {
  return (
    <div className="ob-player">
      <Slider label="Seek" value={position} max={duration} onChange={onSeek} aria-valuetext={`${fmt(position)} of ${fmt(duration)}`} />
      <div className="ob-player__times"><span>{fmt(position)}</span><span>-{fmt(duration - position)}</span></div>
    </div>
  )
}

/* ─────────── Navigation ─────────── */

type NavItemProps = ButtonHTMLAttributes<HTMLButtonElement> & { icon: ReactNode; active?: boolean }

export function NavItem({ icon, active, children, className, ...rest }: NavItemProps) {
  return (
    <button className={cx('ob-nav-item ob-interactive', className)} aria-current={active ? 'page' : undefined} {...rest}>
      {icon}
      {children}
    </button>
  )
}

export function NavLabel({ children }: { children: ReactNode }) {
  return <p className="ob-nav-label">{children}</p>
}

export type Destination = { key: string; label: string; icon: ReactNode }

function NavDestination({ d, active, onSelect }: { d: Destination; active: boolean; onSelect: (k: string) => void }) {
  return (
    <button className="ob-nav-dest" aria-current={active ? 'page' : undefined} onClick={() => onSelect(d.key)}>
      <span className="ob-nav-dest__icon">{d.icon}</span>
      {d.label}
    </button>
  )
}

/** Compact breakpoint: 3–5 destinations along the bottom. */
export function NavigationBar({ items, value, onChange }: { items: Destination[]; value: string; onChange: (k: string) => void }) {
  return (
    <nav className="ob-nav-bar" aria-label="Primary">
      {items.map((d) => <NavDestination key={d.key} d={d} active={value === d.key} onSelect={onChange} />)}
    </nav>
  )
}

/** Medium and expanded breakpoints: vertical rail. */
export function NavigationRail({ items, value, onChange }: { items: Destination[]; value: string; onChange: (k: string) => void }) {
  return (
    <nav className="ob-nav-rail" aria-label="Primary">
      {items.map((d) => <NavDestination key={d.key} d={d} active={value === d.key} onSelect={onChange} />)}
    </nav>
  )
}

export function Tabs({ tabs, value, onChange, label }: { tabs: string[]; value: string; onChange: (t: string) => void; label: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    const n = (i + d + tabs.length) % tabs.length
    refs.current[n]?.focus()
    onChange(tabs[n])
  }
  return (
    <div className="ob-tabs" role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button
          key={t}
          ref={(el) => { refs.current[i] = el }}
          role="tab"
          className="ob-tab ob-interactive"
          aria-selected={value === t}
          tabIndex={value === t ? 0 : -1}
          onClick={() => onChange(t)}
          onKeyDown={(e) => onKey(e, i)}
        >
          <span>{t}</span>
        </button>
      ))}
    </div>
  )
}

/* ─────────── Text input ─────────── */

export function SearchField(props: ComponentPropsWithRef<'input'>) {
  return (
    <label className="ob-search">
      <SearchIcon strokeWidth={2} aria-hidden />
      <input type="search" aria-label={props.placeholder} {...props} />
    </label>
  )
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; support?: string; error?: string; icon?: ReactNode }

/** Outlined field with a persistent label above (Offbeat adapts M3's floating label). */
export function TextField({ label, support, error, icon, disabled, ...rest }: TextFieldProps) {
  const id = useId()
  const supportId = `${id}-support`
  const message = error ?? support
  return (
    <div className="ob-field" data-invalid={Boolean(error) || undefined} data-disabled={disabled || undefined}>
      <label className="ob-field__label" htmlFor={id}>{label}</label>
      <div className="ob-field__control">
        {icon}
        <input id={id} disabled={disabled} aria-invalid={Boolean(error) || undefined} aria-describedby={message ? supportId : undefined} {...rest} />
      </div>
      {message && <p className="ob-field__support" id={supportId}>{message}</p>}
    </div>
  )
}

/* ─────────── Communication ─────────── */

export function LinearProgress({ value, label }: { value?: number; label: string }) {
  const indeterminate = value === undefined
  return (
    <div
      className="ob-progress-linear"
      role="progressbar"
      aria-label={label}
      aria-valuenow={indeterminate ? undefined : value}
      aria-valuemin={0}
      aria-valuemax={100}
      data-indeterminate={indeterminate || undefined}
    >
      <span className="ob-progress-linear__bar" style={indeterminate ? undefined : { width: `${value}%` }} />
    </div>
  )
}

export function CircularProgress({ value, label }: { value?: number; label: string }) {
  const r = 18
  const c = 2 * Math.PI * r
  const indeterminate = value === undefined
  return (
    <svg
      className="ob-progress-circular"
      viewBox="0 0 44 44"
      role="progressbar"
      aria-label={label}
      aria-valuenow={indeterminate ? undefined : value}
      data-indeterminate={indeterminate || undefined}
    >
      <circle className="track" cx="22" cy="22" r={r} />
      <circle className="bar" cx="22" cy="22" r={r} strokeDasharray={c} strokeDashoffset={indeterminate ? c * 0.7 : c * (1 - value / 100)} />
    </svg>
  )
}

/** Plain tooltip. Shows after 500ms on hover, immediately on keyboard focus. */
export function Tooltip({ text, children }: { text: string; children: ReactElement<{ 'aria-describedby'?: string }> }) {
  const id = useId()
  return (
    <span className="ob-tooltip-anchor">
      {cloneElement(children, { 'aria-describedby': id })}
      <span role="tooltip" id={id} className="ob-tooltip">{text}</span>
    </span>
  )
}

export type MenuEntry = { label: string; icon?: ReactNode; danger?: boolean; onSelect?: () => void }

export function Menu({ trigger, items }: { trigger: (p: { onClick: () => void; 'aria-expanded': boolean; 'aria-haspopup': 'menu' }) => ReactNode; items: MenuEntry[] }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    root.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus()
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
    e.preventDefault()
    const els = [...(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])]
    const i = els.indexOf(document.activeElement as HTMLButtonElement)
    els[(i + (e.key === 'ArrowDown' ? 1 : -1) + els.length) % els.length]?.focus()
  }
  return (
    <span className="ob-menu-anchor" ref={root}>
      {trigger({ onClick: () => setOpen((o) => !o), 'aria-expanded': open, 'aria-haspopup': 'menu' })}
      {open && (
        <div className="ob-menu" role="menu" onKeyDown={onKey}>
          {items.map((m) => (
            <button
              key={m.label}
              role="menuitem"
              className="ob-menu-item ob-interactive"
              data-danger={m.danger || undefined}
              onClick={() => { m.onSelect?.(); setOpen(false) }}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}

/** Basic dialog on native <dialog>: focus trap, Esc and backdrop handled by the browser. */
export function Dialog({ open, onClose, headline, icon, children, actions }: {
  open: boolean; onClose: () => void; headline: string; icon?: ReactNode; children: ReactNode; actions: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className="ob-dialog"
      aria-labelledby={id}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      {icon && <div className="ob-dialog__icon">{icon}</div>}
      <h2 className="ob-headline-sm" id={id}>{headline}</h2>
      <div className="ob-dialog__body ob-body-md">{children}</div>
      <div className="ob-dialog__actions">{actions}</div>
    </dialog>
  )
}

export function Snackbar({ message, action, onAction, onClose, duration = 4000 }: {
  message: string; action?: string; onAction?: () => void; onClose: () => void; duration?: number
}) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])
  return (
    <div className="ob-snackbar" role="status" aria-live="polite">
      <span style={{ flex: 1 }}>{message}</span>
      {action && <Button variant="text" onClick={() => { onAction?.(); onClose() }}>{action}</Button>}
    </div>
  )
}

/* ─────────── Containment ─────────── */

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="ob-section-header">
      <h2 className="ob-title-md">{title}</h2>
      {action && <button className="ob-link" onClick={onAction}>{action}</button>}
    </div>
  )
}

/** `badge` sits on the artwork: hidden until hover/focus, always shown while `active`. */
export function MediaCard({ title, subtitle, art, badge, active, label, onClick, onIntent }: {
  title: string; subtitle: string; art: ReactNode; badge?: ReactNode; active?: boolean; label?: string
  onClick?: () => void; onIntent?: () => void
}) {
  return (
    <button
      className="ob-media-card ob-interactive"
      data-active={active || undefined}
      aria-label={label}
      onClick={onClick}
      onPointerEnter={onIntent}
      onFocus={onIntent}
    >
      <span className="ob-media-card__art">{art}{badge && <span className="ob-media-card__badge">{badge}</span>}</span>
      <span className="ob-media-card__text">
        <span className="ob-media-card__title">{title}</span>
        <span className="ob-body-sm">{subtitle}</span>
      </span>
    </button>
  )
}

/**
 * `transitionName` sets view-transition-names on the media (`<name>-media`) and headline
 * (`<name>-title`) so a destination using the same names can morph out of this card.
 */
export function FeatureCard({ headline, body, cta, meta, media, transitionName, onCta, onCtaIntent }: {
  headline: string[]; body: string; cta: string; meta?: string; media: ReactNode
  transitionName?: string; onCta?: () => void; onCtaIntent?: () => void
}) {
  return (
    <div className="ob-feature-wrap">
      <article className="ob-feature">
        <div className="ob-feature__media" style={transitionName ? { viewTransitionName: `${transitionName}-media` } : undefined}>{media}</div>
        <div className="ob-feature__body">
          <h2 className="ob-feature__headline" style={transitionName ? { viewTransitionName: `${transitionName}-title` } : undefined}>
            {headline.map((line) => <span key={line} style={{ display: 'block' }}>{line}</span>)}
          </h2>
          <p className="ob-body-md">{body}</p>
          <div className="ob-feature__actions">
            <Button onClick={onCta} onPointerEnter={onCtaIntent} onFocus={onCtaIntent}>{cta}</Button>
            {meta && <span className="ob-feature__meta">{meta}</span>}
          </div>
        </div>
      </article>
    </div>
  )
}

/** Deterministic pseudo-waveform so the bars don't reshuffle on every render. */
export function Waveform({ bars = 48, seed = 7, live }: { bars?: number; seed?: number; live?: boolean }) {
  const heights = Array.from({ length: bars }, (_, i) => {
    const v = Math.abs(Math.sin(i * 12.9898 + seed) * 43758.5453) % 1
    return 22 + Math.round(v * 78)
  })
  return (
    <div className="ob-wave" aria-hidden data-live={live || undefined}>
      {heights.map((h, i) => <span key={i} style={{ height: `${h}%`, ['--i' as string]: i }} />)}
    </div>
  )
}

export function PromoCard({ title, body, cta, footnote, ctaIcon, live, onCta }: {
  title: string; body: string; cta: string; footnote?: string; ctaIcon?: ReactNode; live?: boolean; onCta?: () => void
}) {
  return (
    <section className="ob-promo">
      <h2 className="ob-headline-sm">{title}</h2>
      <p className="ob-promo__sub">{body}</p>
      <div className="ob-promo__wave"><Waveform live={live} /></div>
      <Button variant="inverse" block leadingIcon={ctaIcon} onClick={onCta} aria-pressed={onCta ? Boolean(live) : undefined}>{cta}</Button>
      {footnote && <p className="ob-promo__foot">{footnote}</p>}
    </section>
  )
}

/** With `onPlay`, the whole row plays; the ↗ action stays separate. `current` swaps the index for an equalizer. */
export function TrackRow({ index, title, genre, art, onPlay, onOpen, current, playing }: {
  index: number; title: string; genre: string; art: ReactNode
  onPlay?: () => void; onOpen?: () => void; current?: boolean; playing?: boolean
}) {
  return (
    <li className="ob-track" data-current={current || undefined}>
      {onPlay && <button className="ob-track__play ob-interactive" aria-label={`Play ${title}, ${genre}`} aria-current={current || undefined} onClick={onPlay} />}
      <span className="ob-track__index">{current ? <Equalizer playing={Boolean(playing)} /> : String(index).padStart(2, '0')}</span>
      <span className="ob-track__thumb">{art}</span>
      <span>
        <p className="ob-title-sm">{title}</p>
        <p className="ob-label-sm">{genre}</p>
      </span>
      <button className="ob-track__action ob-interactive ob-target" aria-label={`Open ${title}`} onClick={onOpen}>
        <ArrowUpRight strokeWidth={2} />
      </button>
    </li>
  )
}

export function ListItem({ headline, supporting, leading, trailing, onClick }: {
  headline: string; supporting?: string; leading?: ReactNode; trailing?: ReactNode; onClick?: () => void
}) {
  return (
    <li>
      <button className="ob-list-item ob-interactive" onClick={onClick}>
        {leading && <span className="ob-list-item__lead">{leading}</span>}
        <span className="ob-list-item__text">
          <span className="ob-list-item__headline">{headline}</span>
          {supporting && <span className="ob-body-sm">{supporting}</span>}
        </span>
        {trailing && <span className="ob-list-item__trail">{trailing}</span>}
      </button>
    </li>
  )
}

/* ─────────── Sheets ─────────── */

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal bottom sheet (M3). Fills its nearest positioned ancestor, which should be the
 * app's viewport-height root (.ob-sheet-host). While open, sibling content is made inert.
 * Drag from the handle or any [data-sheet-drag] region: past 30% of the height,
 * or a quick flick, dismisses it. Otherwise it springs back.
 */
export function BottomSheet({ open, onClose, label, children, className, style }: {
  open: boolean; onClose: () => void; label: string; children: ReactNode; className?: string; style?: CSSProperties
}) {
  const [present, setPresent] = useState(open)
  const layer = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const scrim = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const drag = useRef({ active: false, moved: false, startY: 0, lastY: 0, lastT: 0, v: 0, offset: 0, id: 0 })

  if (open && !present) setPresent(true)

  // Inert background, move focus in, restore focus on close.
  useLayoutEffect(() => {
    if (!open || !layer.current) return
    opener.current = document.activeElement as HTMLElement
    const siblings = [...(layer.current.parentElement?.children ?? [])].filter((c) => c !== layer.current) as HTMLElement[]
    siblings.forEach((el) => { el.inert = true })
    sheet.current?.focus({ preventScroll: true })
    return () => {
      siblings.forEach((el) => { el.inert = false })
      // After the commit: React restores its own saved focus at the end of the mutation phase,
      // which would undo a focus() made directly in this cleanup.
      const target = opener.current
      queueMicrotask(() => target?.focus({ preventScroll: true }))
    }
  }, [open])

  // Unmount after the exit transition (with a fallback in case transitionend never fires).
  useEffect(() => {
    if (open || !present) return
    const t = setTimeout(() => setPresent(false), 450)
    return () => clearTimeout(t)
  }, [open, present])

  const resetInline = () => {
    if (sheet.current) { sheet.current.style.transform = ''; sheet.current.style.transition = '' }
    if (scrim.current) { scrim.current.style.opacity = ''; scrim.current.style.transition = '' }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
    if (e.key !== 'Tab' || !sheet.current) return
    const els = [...sheet.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => !el.closest('[inert]'))
    if (!els.length) return
    const first = els[0], last = els[els.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === sheet.current)) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }

  const onPointerDown = (e: PointerEvent) => {
    if (!(e.target as Element).closest('[data-sheet-drag]')) return
    drag.current = { active: true, moved: false, startY: e.clientY, lastY: e.clientY, lastT: e.timeStamp, v: 0, offset: 0, id: e.pointerId }
  }
  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current
    const el = sheet.current
    if (!d.active || !el) return
    const dy = e.clientY - d.startY
    if (!d.moved) {
      if (Math.abs(dy) < 6) return
      d.moved = true
      el.setPointerCapture(d.id)
      el.style.transition = 'none'
      if (scrim.current) scrim.current.style.transition = 'none'
    }
    d.offset = dy > 0 ? dy : dy * 0.15 // rubber-band upward
    d.v = (e.clientY - d.lastY) / Math.max(1, e.timeStamp - d.lastT)
    d.lastY = e.clientY
    d.lastT = e.timeStamp
    el.style.transform = `translateY(${d.offset}px)`
    if (scrim.current) scrim.current.style.opacity = String(Math.max(0, 1 - d.offset / el.offsetHeight))
  }
  const onPointerUp = () => {
    const d = drag.current
    const el = sheet.current
    d.active = false
    if (!d.moved || !el) return
    const dismiss = d.offset > el.offsetHeight * 0.3 || d.v > 0.6
    resetInline()
    if (dismiss) {
      el.style.transform = `translateY(${d.offset}px)`
      el.getBoundingClientRect() // commit the start position before the exit transition
      el.style.transform = ''
      onClose()
    }
  }
  // A drag that started on a button must not also click it.
  const onClickCapture = (e: MouseEvent) => {
    if (drag.current.moved) { e.stopPropagation(); e.preventDefault(); drag.current.moved = false }
  }

  if (!present) return null
  return (
    <div ref={layer} className="ob-sheet-layer" data-state={open ? 'open' : 'closed'}>
      <div ref={scrim} className="ob-sheet-scrim" onClick={onClose} />
      <div
        ref={sheet}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cx('ob-sheet', className)}
        style={style}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={onClickCapture}
        onTransitionEnd={(e) => { if (!open && e.target === sheet.current && e.propertyName === 'transform') setPresent(false) }}
      >
        <button className="ob-sheet__handle" data-sheet-drag aria-label={`Close ${label.toLowerCase()}`} onClick={onClose}>
          <span />
        </button>
        <div className="ob-sheet__body">{children}</div>
      </div>
    </div>
  )
}

export * from './player'
