import { useCallback, useState, type ReactNode } from 'react'
import {
  BookOpen, Bell, ChevronRight, Download, Flag, Headphones, Heart, Home, ListPlus, Mail, MoreHorizontal, Music, Play, Radio, Search, Share2, Trash2,
} from 'lucide-react'
import {
  Art, Avatar, Badge, Button, Checkbox, Chip, CircularProgress, Dialog, FeatureCard, IconButton, LinearProgress, ListItem,
  BottomSheet, MediaCard, MiniPlayer, NowPlaying, PlayerBar, usePlayback, type Track, Menu, NavigationBar, NavigationRail, NavItem, NavLabel, PlaybackScrubber, PromoCard, Radio as RadioButton,
  SearchField, SectionHeader, Slider, Snackbar, Switch, Tabs, TextField, Tooltip, TrackRow, type Destination,
} from '../components'
import './styleguide.css'

/* ─────────── Data ─────────── */

const primitives: { group: string; items: [string, string, boolean?][] }[] = [
  { group: 'Graphite', items: [
    ['950', '#0C0D0E', true], ['900', '#131416'], ['875', '#1A1B1D', true], ['850', '#1F2023', true], ['800', '#26292D'],
    ['750', '#262729'], ['700', '#303338', true], ['500', '#424345'], ['400', '#7A7B7E', true], ['300', '#A1A1A2'],
    ['100', '#E7E8E8'], ['50', '#FDFDFD'],
  ] },
  { group: 'Volt', items: [['950', '#293112'], ['700', '#4A5C0F', true], ['500', '#CBF558'], ['300', '#E4FBA6', true]] },
  { group: 'Signal (error only)', items: [['900', '#690005', true], ['800', '#93000A', true], ['200', '#FFB4AB', true], ['100', '#FFDAD6', true]] },
]

const roleGroups: { group: string; roles: [string, string, string][] }[] = [
  { group: 'Primary', roles: [
    ['primary', 'volt-500', 'Filled buttons, selected chip, promo panel, active indicators'],
    ['on-primary', 'graphite-900', 'Text and icons on primary'],
    ['on-primary-variant', 'graphite-500', 'Offbeat add-on: secondary text on lime'],
    ['primary-container', 'volt-950', 'Active nav item, tonal icon button'],
    ['on-primary-container', 'graphite-50', 'Content on primary container'],
  ] },
  { group: 'Secondary (neutral)', roles: [
    ['secondary-container', 'graphite-800', 'Unselected chips, tonal buttons'],
    ['on-secondary-container', 'graphite-100', 'Content on secondary container'],
  ] },
  { group: 'Error', roles: [
    ['error', 'signal-200', 'Error text, icons, field outline'],
    ['on-error', 'signal-900', 'Content on error'],
    ['error-container', 'signal-800', 'Error banners'],
    ['on-error-container', 'signal-100', 'Content on error container'],
  ] },
  { group: 'Surface', roles: [
    ['surface', 'graphite-900', 'App background'],
    ['surface-container-lowest', 'graphite-950', 'Recessed wells'],
    ['surface-container-low', 'graphite-875', 'Subtle grouping'],
    ['surface-container', 'graphite-850', 'Navigation bar'],
    ['surface-container-high', 'graphite-800', 'Cards, dialogs'],
    ['surface-container-highest', 'graphite-700', 'Menus, slider and progress tracks'],
    ['on-surface', 'graphite-100', 'Primary text and icons'],
    ['on-surface-variant', 'graphite-300', 'Secondary text, inactive icons'],
  ] },
  { group: 'Outline & inverse', roles: [
    ['outline', 'graphite-400', 'Field borders, switch track: anything needing 3:1'],
    ['outline-variant', 'graphite-750', 'Dividers, column rules'],
    ['inverse-surface', 'graphite-100', 'Snackbar, tooltip'],
    ['inverse-on-surface', 'graphite-900', 'Text on inverse surface'],
    ['inverse-primary', 'volt-700', 'Action text on inverse surface'],
  ] },
]

const typeRoles: [string, string, string][] = [
  ['headline-lg', '32/40 · 700 · −2%', 'Find your next obsession'],
  ['headline-md', '28/36 · 700 · −2%', 'Find your next obsession'],
  ['headline-sm', '24/32 · 700 · −2%', 'Not on the FM.'],
  ['title-md', '16/24 · 600', 'Made for Misugla'],
  ['title-sm', '13/18 · 500', 'After Hours'],
  ['body-lg', '16/26 · 400', 'The scene was never about the DJ. It was the room, the heat, the moment a track lands.'],
  ['body-md', '14/20 · 400', 'Fresh sounds. Real stories. Culture that moves you.'],
  ['body-sm', '12/16 · 400', 'Meet the new voices rewriting R&B'],
  ['label-lg', '14/20 · 500', 'Read the story'],
  ['label-md', '12/16 · 500', 'Discover'],
  ['label-sm', '11/16 · 400', 'On your frequency'],
]

const shapes: [string, number, string][] = [
  ['none', 0, ''], ['xs', 4, 'Thumbs, tooltip'], ['sm', 8, 'Nav, promo, fields, snackbar'], ['md', 12, 'Card art, menus'],
  ['lg', 16, 'Cards, hero'], ['lg-increased', 20, ''], ['xl', 28, 'Dialogs'], ['xl-increased', 32, ''], ['xxl', 48, ''], ['full', 999, 'Buttons, chips, avatars'],
]

const elevations: [number, string, string][] = [
  [0, 'surface', 'Everything at rest: cards, chips, buttons, nav'],
  [1, 'surface-container-low', 'Not assigned'],
  [2, 'surface-container-highest', 'Menu, plain tooltip'],
  [3, 'surface-container-high', 'Dialog, snackbar'],
  [4, 'surface-container-high', 'Not assigned'],
  [5, 'surface-container-high', 'Not assigned'],
]

const motions: [string, string, string][] = [
  ['spatial-fast', '350ms · overshoot', 'Switch handle, checkbox tick, button press'],
  ['spatial-default', '500ms · overshoot', 'Card artwork zoom, panels'],
  ['spatial-slow', '650ms · overshoot', 'Full-screen transitions'],
  ['effects-fast', '150ms · no overshoot', 'State layers, colour changes'],
  ['effects-default', '200ms · no overshoot', 'Nav indicator fill, scrim'],
  ['effects-slow', '300ms · no overshoot', 'Progress, content refresh'],
]

const breakpointRows: [string, string, string, string][] = [
  ['Compact', '< 600', 'Navigation bar (bottom)', 'One column; aside stacks under main; cards scroll sideways'],
  ['Medium', '600–839', 'Navigation rail', 'One column; aside stacks under main'],
  ['Expanded', '840–1199', 'Navigation rail', 'Main, then aside as two columns'],
  ['Large', '1200–1599', 'Sidebar', 'Three columns: the Figma reference'],
  ['Extra-large', '1600+', 'Sidebar', 'Three columns, content max 1328'],
]

type Status = 'Adopted' | 'Adapted' | 'Added' | 'Deviation' | 'Open' | 'Partial'
const audit: [string, string, string, Status][] = [
  ['Color roles', '26 roles across primary, secondary, tertiary, error, surface, outline', 'Full role set. Secondary is neutral and there is no tertiary: Offbeat has one accent.', 'Adapted'],
  ['Error', 'Error + error container pairs', 'Signal ramp (M3 baseline dark error tones), used for errors only', 'Added'],
  ['Surface containers', 'Five container tones for hierarchy', 'Mapped onto Graphite; sampled card colour becomes container-high', 'Added'],
  ['Outline', 'outline needs 3:1 for boundaries; outline-variant for dividers', 'New outline #7A7B7E (4.3:1 on surface); sampled divider becomes outline-variant', 'Added'],
  ['Inverse roles', 'For snackbars and tooltips', 'Light inverse surface with dark olive action text', 'Added'],
  ['Light scheme', 'Every scheme ships light and dark', 'Dark only. The brand is a dark product; light is an open decision.', 'Open'],
  ['State layers', 'Hover 8%, focus 10%, pressed 10%, dragged 16%; disabled 38% / 12%', 'Adopted as-is. Replaces the hand-picked hover fills from v0.1.', 'Adopted'],
  ['Elevation', 'Levels 0–5 via tone and shadow', 'Resting surfaces are level 0 and use tone only. Shadows appear only on floating layers.', 'Adapted'],
  ['Shape', 'Ten-step corner scale', 'Full scale adopted. Source radii land on sm, md and lg.', 'Adopted'],
  ['Optical roundness', 'Inner radius = outer radius − padding', 'Media card artwork keeps the source 12px inside a 16px card with 12px padding', 'Deviation'],
  ['Typography', '15 roles, brand + plain typeface', '11 roles in use. Inter serves as both. Headlines get −2% tracking.', 'Adapted'],
  ['Motion', 'Spring schemes: spatial (overshoots) vs effects (no overshoot)', 'Expressive scheme via M3 web curve conversions; reduced motion removes spatial movement', 'Adopted'],
  ['Breakpoints', 'Compact → extra-large, with nav changing per size', 'Navigation bar → rail → sidebar; aside folds under main below large', 'Added'],
  ['Touch targets', '48dp minimum target', 'Visual sizes kept (30–40px) with invisible 48px hit areas', 'Adopted'],
  ['Badge', 'Uses the error colour', 'Uses primary. Red would read as a second accent and as an error.', 'Adapted'],
  ['Text field', 'Floating label', 'Persistent label above the field, so the label never disappears', 'Adapted'],
  ['Components', '~30 components', '21 built. Not yet: FAB, sheets, date/time pickers, carousel, toolbar, split button, button group, segmented button.', 'Partial'],
]

const sidebarNav: [string, ReactNode][] = [['Discover', <Search />], ['Saved', <Heart />], ['Music', <Music />], ['Culture', <BookOpen />]]
const freqNav: [string, ReactNode][] = [['Playlist', <Headphones />], ['Offbeat radio', <Radio />]]
const destinations: Destination[] = [
  { key: 'Discover', label: 'Discover', icon: <Home /> },
  { key: 'Music', label: 'Music', icon: <Music /> },
  { key: 'Culture', label: 'Culture', icon: <BookOpen /> },
  { key: 'Saved', label: 'Saved', icon: <Heart /> },
  { key: 'Offbeat radio', label: 'Radio', icon: <Radio /> },
]
const filters = ['For you', 'Music', 'Culture', 'New releases', 'Playlist']
const queue: Track[] = [
  { id: 'a', title: 'After Hours', artist: 'Nala Sky', source: 'Daily mix 01', duration: 214, tone: 4, tint: '#9a3a30' },
  { id: 'b', title: 'Lagos Heat (Extended Mix)', artist: 'Tems Adebayo & The Low End', source: 'Daily mix 01', duration: 187, tone: 2, tint: '#4a6a9a' },
  { id: 'c', title: 'Fever Glass', artist: 'Ochre', source: 'Daily mix 01', duration: 243, tone: 3, tint: '#e2475f' },
]

function NowPlayingDemo() {
  const player = usePlayback(queue)
  const [open, setOpen] = useState(false)
  return (
    <div className="sg-phone ob-sheet-host">
      <div className="sg-phone__screen">
        <div className="ref-host" style={{ width: '100%' }}>
          <ReferenceScreen miniPlayer={<MiniPlayer player={player} expanded={open} onExpand={() => setOpen(true)} />} />
        </div>
      </div>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        label="Now playing"
        className="ob-player-sheet"
        style={{ ['--sheet-tint' as string]: player.track.tint }}
      >
        <NowPlaying player={player} onCollapse={() => setOpen(false)} />
      </BottomSheet>
    </div>
  )
}

function PlayerBarDemo() {
  const player = usePlayback(queue)
  return <div className="sg-dock"><PlayerBar player={player} expanded={false} onExpand={() => {}} /></div>
}

const frames = [['Compact', 390], ['Medium', 720], ['Expanded', 1000], ['Large', 1280]] as const

/* ─────────── Reference screen (adaptive) ─────────── */

export function ReferenceScreen({ miniPlayer }: { miniPlayer?: ReactNode }) {
  const [filter, setFilter] = useState('For you')
  const [nav, setNav] = useState('Discover')
  return (
    <div className="ref">
      <header className="ref__appbar">
        <span className="ob-title-md">Offbeat</span>
        <div className="ref__actions">
          <IconButton label="Search"><Search /></IconButton>
          <IconButton label="Notifications" variant="tonal" badge><Bell /></IconButton>
          <Avatar name="Misugla" />
        </div>
      </header>

      <aside className="ref__sidebar">
        <nav className="ob-nav" aria-label="Primary">
          {sidebarNav.map(([l, i]) => <NavItem key={l} icon={i} active={nav === l} onClick={() => setNav(l)}>{l}</NavItem>)}
        </nav>
        <NavLabel>On your frequency</NavLabel>
        <nav className="ob-nav" aria-label="Your frequency">
          {freqNav.map(([l, i]) => <NavItem key={l} icon={i} active={nav === l} onClick={() => setNav(l)}>{l}</NavItem>)}
        </nav>
      </aside>

      <div className="ref__rail"><NavigationRail items={destinations} value={nav} onChange={setNav} /></div>

      <div className="ref__body">
        <main className="ref__main">
          <div className="ref__top">
            <div className="ref__search"><SearchField placeholder="Search music, artist, culture..." /></div>
            <div className="ref__actions">
              <IconButton label="Notifications" variant="tonal" badge><Bell /></IconButton>
              <Avatar name="Misugla" />
            </div>
          </div>

          <div className="ref__intro">
            <h1 className="ob-headline-lg ref__title">Find your next obsession</h1>
            <p className="ob-body-md">Fresh sounds. Real stories. Culture that moves you.</p>
            <div className="ob-chip-group ref__chips" role="group" aria-label="Filter">
              {filters.map((f) => (
                <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{f}</Chip>
              ))}
            </div>
          </div>

          <FeatureCard
            headline={['A new wave.', 'A louder future.']}
            body="Meet the women reshaping the underground, one dancefloor at a time."
            cta="Read the story"
            meta="8 min read"
            media={<Art tone={4} />}
          />

          <SectionHeader title="Made for Misugla" action="See all" />
          <div className="ref__grid">
            <MediaCard title="Daily mix 01" subtitle="Meet the new voices rewriting R&B" art={<Art tone={1} />} />
            <MediaCard title="Daily mix 02" subtitle="Fresh frequencies" art={<Art tone={2} />} />
            <MediaCard title="Daily mix 03" subtitle="The night belongs to us" art={<Art tone={3} />} />
          </div>
        </main>

        <aside className="ref__aside">
          <PromoCard
            title="Not on the FM."
            body="For the ones who listen a little differently."
            cta="Tune in"
            ctaIcon={<Play strokeWidth={2} />}
            footnote="Original studio previews, always exploring."
          />
          <div className="ref__repeat">
            <div className="ob-section-header">
              <h2 className="ob-title-md">On repeat</h2>
              <span className="ob-body-sm">This week</span>
            </div>
            <ul className="ob-list">
              {[1, 2, 3].map((n) => <TrackRow key={n} index={n} title="After Hours" genre="Electronic" art={<Art tone={4} />} />)}
            </ul>
          </div>
        </aside>
      </div>

      <div className="ref__navbar">{miniPlayer}<NavigationBar items={destinations.slice(0, 4)} value={nav} onChange={setNav} /></div>
    </div>
  )
}

/* ─────────── Guide scaffolding ─────────── */

function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="sg-section">
      <header className="sg-section__head">
        <h2 className="ob-headline-sm">{title}</h2>
        {intro && <p className="ob-body-md">{intro}</p>}
      </header>
      {children}
    </section>
  )
}

function Specimen({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className="sg-specimen" data-wide={wide || undefined}>
      <span className="sg-specimen__label">{label}</span>
      <div className="sg-specimen__stage">{children}</div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="sg-group">
      <h3 className="ob-title-md">{title}</h3>
      <div className="sg-grid">{children}</div>
    </div>
  )
}

function MotionDemo({ token }: { token: string }) {
  const [on, setOn] = useState(false)
  return (
    <button className="sg-motion" onClick={() => setOn((v) => !v)} aria-label={`Play ${token}`}>
      <span
        className="sg-motion__dot"
        style={{
          transition: token.startsWith('spatial') ? `transform var(--motion-${token})` : `background-color var(--motion-${token}), opacity var(--motion-${token})`,
          transform: token.startsWith('spatial') && on ? 'translateX(160px)' : undefined,
          background: !token.startsWith('spatial') && on ? 'var(--color-primary)' : undefined,
        }}
      />
    </button>
  )
}

/* ─────────── Guide ─────────── */

export function Styleguide() {
  const [frame, setFrame] = useState<number>(1280)
  const [saved, setSaved] = useState(true)
  const [tab, setTab] = useState('Tracks')
  const [sw, setSw] = useState({ hq: true, explicit: false })
  const [vol, setVol] = useState(64)
  const [pos, setPos] = useState(83)
  const [quality, setQuality] = useState('high')
  const [dialog, setDialog] = useState(false)
  const [snack, setSnack] = useState<string | null>(null)
  const closeSnack = useCallback(() => setSnack(null), [])

  return (
    <div className="sg">
      <header className="sg-hero">
        <p className="ob-label-sm sg-eyebrow">Design system · v0.2 · Figma 1277:184 + Material 3</p>
        <h1 className="ob-headline-lg">Offbeat</h1>
        <p className="ob-body-md" style={{ maxWidth: 600 }}>
          A dark, near-monochrome ground with one electric accent. v0.2 takes Material 3's structure (color roles, state layers,
          elevation, shape scale, type roles, spring motion and breakpoints) and fills it with Offbeat's own values.
        </p>
        <nav className="sg-toc">
          {['Reference', 'Alignment', 'Colour', 'States', 'Elevation', 'Type', 'Shape', 'Layout', 'Motion', 'Components', 'Player', 'Rules'].map((s) => (
            <a key={s} href={`#${s.toLowerCase()}`}>{s}</a>
          ))}
        </nav>
      </header>

      <Section id="reference" title="Reference, rebuilt" intro="The source screen built only from system parts. Switch breakpoints to see navigation and layout adapt.">
        <div className="ob-chip-group" role="group" aria-label="Breakpoint">
          {frames.map(([name, w]) => <Chip key={name} selected={frame === w} onClick={() => setFrame(w)}>{name} · {w}</Chip>)}
        </div>
        <div className="sg-frame"><div className="ref-host" style={{ width: frame }}><ReferenceScreen /></div></div>
      </Section>

      <Section id="alignment" title="M3 alignment" intro="What Material 3 asks for, and what Offbeat does with it.">
        <div className="sg-table-wrap">
          <table className="sg-table">
            <thead><tr><th>Area</th><th>Material 3</th><th>Offbeat</th><th>Status</th></tr></thead>
            <tbody>
              {audit.map(([a, m, o, s]) => (
                <tr key={a}><td className="sg-strong">{a}</td><td>{m}</td><td>{o}</td><td><span className="sg-status" data-status={s}>{s}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="colour" title="Colour" intro="Three primitive ramps feed M3's role set. Components only read roles. † = derived, not in the source.">
        {primitives.map((p) => (
          <div key={p.group} className="sg-ramp">
            <h3 className="ob-title-md">{p.group}</h3>
            <div className="sg-ramp__row">
              {p.items.map(([k, hex, derived]) => (
                <div key={k} className="sg-swatch">
                  <span className="sg-swatch__chip" style={{ background: hex }} />
                  <span className="ob-body-sm sg-strong">{k}{derived ? ' †' : ''}</span>
                  <span className="ob-label-sm">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="sg-table-wrap">
          <table className="sg-table">
            <thead><tr><th>Role</th><th>Maps to</th><th>Use</th></tr></thead>
            {roleGroups.map((g) => (
              <tbody key={g.group}>
                <tr><th colSpan={3} className="sg-table__group">{g.group}</th></tr>
                {g.roles.map(([r, m, u]) => (
                  <tr key={r}>
                    <td><span className="sg-dot" style={{ background: `var(--color-${r})` }} /><code>--color-{r}</code></td>
                    <td><code>{m}</code></td>
                    <td>{u}</td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </Section>

      <Section id="states" title="States" intro="A state layer is an overlay in the content colour at a fixed opacity. One rule covers every component.">
        <div className="sg-states">
          {[['Enabled', ''], ['Hover · 8%', 'hover'], ['Focus · 10%', 'focus'], ['Pressed · 10%', 'pressed'], ['Dragged · 16%', 'dragged']].map(([l, s]) => (
            <div key={l} className="sg-state" data-force={s || undefined}>
              <span className="ob-label-sm">{l}</span>
              <Button>Read the story</Button>
              <Button variant="tonal">See all</Button>
              <Chip>Music</Chip>
            </div>
          ))}
          <div className="sg-state">
            <span className="ob-label-sm">Disabled · 38% / 12%</span>
            <Button disabled>Read the story</Button>
            <Button variant="tonal" disabled>See all</Button>
            <Chip disabled>Music</Chip>
          </div>
        </div>
      </Section>

      <Section id="elevation" title="Elevation" intro="Resting surfaces stay at level 0 and separate by tone. Shadows only appear on things that float over content.">
        <div className="sg-elev">
          {elevations.map(([lvl, surf, use]) => (
            <div key={lvl} className="sg-elev__item">
              <span className="sg-elev__box" style={{ boxShadow: `var(--elevation-${lvl})`, background: `var(--color-${surf})` }}>
                <span className="ob-title-md">{lvl}</span>
              </span>
              <code>elevation-{lvl}</code>
              <span className="ob-label-sm">{use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="type" title="Type" intro="Inter, mapped to M3 roles. headline-md replaces headline-lg at compact. body-lg is new, for long-form Culture stories.">
        <div className="sg-type">
          {typeRoles.map(([name, spec, sample]) => (
            <div key={name} className="sg-type__row">
              <div><code>{name}</code><span className="ob-label-sm" style={{ display: 'block' }}>{spec}</span></div>
              <p style={{ font: `var(--type-${name})`, letterSpacing: name.startsWith('headline') ? 'var(--tracking-tight)' : undefined, margin: 0, maxWidth: 640 }}>{sample}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="shape" title="Shape" intro="M3's ten-step corner scale. Nested corners follow optical roundness: inner = outer − padding.">
        <div className="sg-radii">
          {shapes.map(([n, r, u]) => (
            <div key={n} className="sg-radius">
              <span className="sg-radius__box" style={{ borderRadius: Math.min(r, 36) }} />
              <code>shape-{n}</code>
              <span className="ob-label-sm">{r === 999 ? 'pill' : `${r}px`}{u && ` · ${u}`}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="layout" title="Layout" intro="4pt spacing. M3 breakpoints decide which navigation shows and how the aside column folds.">
        <div className="sg-space">
          {[4, 8, 12, 16, 20, 24, 32, 40].map((s) => (
            <div key={s} className="sg-space__row">
              <code>space-{s / 4}</code>
              <span className="sg-space__bar" style={{ width: s }} />
              <span className="ob-label-sm">{s}px</span>
            </div>
          ))}
        </div>
        <div className="sg-table-wrap">
          <table className="sg-table">
            <thead><tr><th>Breakpoint</th><th>Width</th><th>Navigation</th><th>Layout</th></tr></thead>
            <tbody>{breakpointRows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? 'sg-strong' : undefined}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Section>

      <Section id="motion" title="Motion" intro="M3 springs, converted to CSS curves. Spatial tokens overshoot and settle; effects tokens never overshoot. Click a track to play it.">
        <div className="sg-motions">
          {motions.map(([t, spec, use]) => (
            <div key={t} className="sg-motions__row">
              <div><code>motion-{t}</code><span className="ob-label-sm" style={{ display: 'block' }}>{spec} · {use}</span></div>
              <MotionDemo token={t} />
            </div>
          ))}
        </div>
      </Section>

      <Section id="components" title="Components" intro="Grouped as M3 groups them. Each one uses state layers, a 2px Volt focus ring and a 48px target.">
        <Group title="Actions">
          <Specimen label="Button · filled / tonal / outlined / text">
            <Button>Read the story</Button>
            <Button variant="tonal">See all</Button>
            <Button variant="outlined" leadingIcon={<Share2 />}>Share</Button>
            <Button variant="text">Not now</Button>
          </Specimen>
          <Specimen label="Button · inverse (on lime only)">
            <div className="sg-on-lime"><Button variant="inverse" block leadingIcon={<Play />}>Tune in</Button></div>
          </Specimen>
          <Specimen label="Icon button · standard / toggle / tonal / filled / outlined">
            <Tooltip text="More options"><IconButton label="More"><MoreHorizontal /></IconButton></Tooltip>
            <Tooltip text={saved ? 'Remove from saved' : 'Save'}>
              <IconButton label="Save" selected={saved} onClick={() => setSaved((s) => !s)}><Heart /></IconButton>
            </Tooltip>
            <IconButton label="Notifications" variant="tonal" badge><Bell /></IconButton>
            <IconButton label="Play" variant="filled"><Play /></IconButton>
            <IconButton label="Download" variant="outlined"><Download /></IconButton>
          </Specimen>
          <Specimen label="Badge · dot / count · Avatar">
            <IconButton label="Inbox" badge={3}><Mail /></IconButton>
            <IconButton label="Inbox" badge={128}><Mail /></IconButton>
            <span style={{ position: 'relative', display: 'inline-flex' }}><Avatar name="Misugla Okafor" /><Badge /></span>
          </Specimen>
        </Group>

        <Group title="Selection">
          <Specimen label="Filter chip · selected / default">
            <div className="ob-chip-group">
              <Chip selected>For you</Chip>
              <Chip>Music</Chip>
              <Chip>New releases</Chip>
            </div>
          </Specimen>
          <Specimen label="Switch">
            <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 300 }}>
              <Switch label="High-quality streaming" checked={sw.hq} onChange={(v) => setSw((s) => ({ ...s, hq: v }))} />
              <Switch label="Allow explicit content" checked={sw.explicit} onChange={(v) => setSw((s) => ({ ...s, explicit: v }))} />
              <Switch label="Offline mode (Premium)" checked={false} onChange={() => {}} disabled />
            </div>
          </Specimen>
          <Specimen label="Checkbox · Radio">
            <div style={{ display: 'grid' }}>
              <Checkbox label="New releases" defaultChecked />
              <Checkbox label="Culture stories" />
              <Checkbox label="Unavailable" disabled />
            </div>
            <div role="radiogroup" aria-label="Audio quality" style={{ display: 'grid' }}>
              {[['low', 'Data saver'], ['high', 'High'], ['lossless', 'Lossless']].map(([v, l]) => (
                <RadioButton key={v} name="quality" label={l} value={v} checked={quality === v} onChange={() => setQuality(v)} />
              ))}
            </div>
          </Specimen>
          <Specimen label="Slider · playback scrubber / volume">
            <div style={{ display: 'grid', gap: 16, width: '100%' }}>
              <PlaybackScrubber position={pos} duration={214} onSeek={setPos} />
              <Slider label="Volume" value={vol} onChange={setVol} />
            </div>
          </Specimen>
        </Group>

        <Group title="Navigation">
          <Specimen label="Sidebar item · section label (large+)">
            <div style={{ width: 158 }}>
              <NavItem icon={<Search />} active>Discover</NavItem>
              <NavItem icon={<Heart />}>Saved</NavItem>
              <NavLabel>On your frequency</NavLabel>
              <NavItem icon={<Radio />}>Offbeat radio</NavItem>
            </div>
          </Specimen>
          <Specimen label="Navigation rail (medium, expanded)">
            <div className="sg-rail-demo"><NavigationRail items={destinations.slice(0, 3)} value="Discover" onChange={() => {}} /></div>
          </Specimen>
          <Specimen label="Navigation bar (compact)" wide>
            <div style={{ width: '100%', maxWidth: 400 }}><NavigationBar items={destinations.slice(0, 4)} value="Music" onChange={() => {}} /></div>
          </Specimen>
          <Specimen label="Tabs (arrow keys move between tabs)" wide>
            <div style={{ width: '100%' }}><Tabs label="Artist" tabs={['Tracks', 'Albums', 'Stories', 'About']} value={tab} onChange={setTab} /></div>
          </Specimen>
        </Group>

        <Group title="Text input">
          <Specimen label="Search (underline, in-page)">
            <div style={{ width: '100%', maxWidth: 360 }}><SearchField placeholder="Search music, artist, culture..." /></div>
          </Specimen>
          <Specimen label="Text field · default / error / disabled" wide>
            <div className="sg-fields">
              <TextField label="Playlist name" placeholder="Late-night drives" support="You can change this later" />
              <TextField label="Email" icon={<Mail />} defaultValue="misugla@" error="Enter a full email, like name@example.com" />
              <TextField label="Invite code" disabled placeholder="Locked" />
            </div>
          </Specimen>
        </Group>

        <Group title="Communication">
          <Specimen label="Progress · linear / circular, determinate / indeterminate">
            <div style={{ display: 'grid', gap: 16, width: '100%' }}>
              <LinearProgress value={62} label="Download progress" />
              <LinearProgress label="Loading" />
            </div>
            <CircularProgress value={70} label="Upload progress" />
            <CircularProgress label="Loading" />
          </Specimen>
          <Specimen label="Tooltip (hover 500ms, or keyboard focus)">
            <Tooltip text="Add to queue"><IconButton label="Add to queue" variant="outlined"><ListPlus /></IconButton></Tooltip>
          </Specimen>
          <Specimen label="Menu (Esc or outside click closes)">
            <Menu
              trigger={(p) => <IconButton label="Track options" variant="outlined" {...p}><MoreHorizontal /></IconButton>}
              items={[
                { label: 'Add to queue', icon: <ListPlus />, onSelect: () => setSnack('Added to queue') },
                { label: 'Share', icon: <Share2 /> },
                { label: 'Report', icon: <Flag /> },
                { label: 'Remove from library', icon: <Trash2 />, danger: true, onSelect: () => setDialog(true) },
              ]}
            />
          </Specimen>
          <Specimen label="Dialog · Snackbar">
            <Button variant="tonal" trailingIcon={false} onClick={() => setDialog(true)}>Open dialog</Button>
            <Button variant="outlined" trailingIcon={false} onClick={() => setSnack('Saved to your library')}>Show snackbar</Button>
          </Specimen>
        </Group>

        <Group title="Containment">
          <Specimen label="Media card">
            <div style={{ width: 240 }}><MediaCard title="Daily mix 01" subtitle="Meet the new voices rewriting R&B" art={<Art tone={1} />} /></div>
          </Specimen>
          <Specimen label="List item · Track row · Divider">
            <div style={{ width: '100%', display: 'grid', gap: 8 }}>
              <ul className="ob-list">
                <ListItem headline="Downloads" supporting="42 tracks · 380 MB" leading={<Download />} trailing={<ChevronRight />} />
              </ul>
              <hr className="ob-divider" />
              <ul className="ob-list"><TrackRow index={1} title="After Hours" genre="Electronic" art={<Art tone={4} />} /></ul>
            </div>
          </Specimen>
        </Group>
      </Section>

      <Section id="player" title="Now playing" intro="Mini player plus a modal bottom sheet, at compact. Tap the mini player to open it. Drag the handle, header or artwork down to dismiss; Esc and the scrim work too.">
        <div className="sg-player">
          <NowPlayingDemo />
          <div className="sg-player__notes">
            <h3 className="ob-title-md">Anatomy</h3>
            <ol className="sg-rules">
              <li><strong>Mini player</strong>: 56px, docked above the navigation bar, floating (elevation 2, so it gets a shadow). The whole bar opens the sheet; play and next work in place. A 2px progress line runs along its bottom edge.</li>
              <li><strong>Bottom sheet</strong>: M3 modal sheet. Top corners use <code>shape-xl</code>, the drag handle is 32×4, the scrim covers the background, and maximum width is 640px. The artwork's colour tints the top of the sheet at 28%.</li>
              <li><strong>Transport</strong>: a 64px filled play button is the single Volt moment. Shuffle and repeat are toggles that show a dot when on; repeat cycles off → all → one.</li>
            </ol>
            <h3 className="ob-title-md">Behaviour</h3>
            <ol className="sg-rules">
              <li><strong>Open</strong> on <code>motion-spatial-default</code>, with a slight overshoot. The surface extends below the sheet so the bounce never shows a gap. <strong>Close</strong> on <code>motion-exit</code>, which doesn't bounce.</li>
              <li><strong>Drag to dismiss</strong>: the sheet follows your finger, and the scrim fades in proportion. It dismisses past 30% of its height or on a flick faster than 0.6px/ms; otherwise it springs back. Dragging upward is rubber-banded.</li>
              <li><strong>Focus</strong>: when open, focus moves into the sheet and stays there, and the rest of the screen is inert. On close, focus returns to the mini player.</li>
              <li><strong>Wider screens</strong>: from 840px the docked player bar replaces the mini player. The sheet still opens from its expand button, capped at 640px and centred.</li>
            </ol>
          </div>
        </div>
        <div className="sg-group">
          <h3 className="ob-title-md">Player bar (expanded and up)</h3>
          <p className="ob-body-md" style={{ maxWidth: 680 }}>
            Docked to the bottom edge at 80px. It rests on the page, so it uses tone and a top rule, with no shadow. The left column holds track and save, the centre holds transport and scrubber, and the right holds queue, device, volume and expand. Below 1000px of bar width, queue, device and the volume slider drop out. Title and art cross-fade on track change. Space toggles playback when you aren't in a field, and OS media keys work through the Media Session API.
          </p>
          <PlayerBarDemo />
        </div>
      </Section>

      <Section id="rules" title="Rules">
        <ol className="sg-rules">
          <li><strong>One Volt moment per view.</strong> Lime fills the selected chip, the primary CTA and at most one panel. Never two large lime areas competing. Badges use lime, not red.</li>
          <li><strong>Pair roles, never colours.</strong> Text on <code>primary</code> is always <code>on-primary</code>. Never mix pairs (M3).</li>
          <li><strong>States are layers, not new colours.</strong> Never hand-pick a hover colour. Add <code>ob-interactive</code> and the content colour does the work.</li>
          <li><strong>Depth is tone at rest, shadow in flight.</strong> Cards and chips never cast shadows. Menus, dialogs and snackbars do.</li>
          <li><strong>outline for boundaries, outline-variant for decoration.</strong> Fields and switch tracks need 3:1; dividers don't.</li>
          <li><strong>Spatial overshoots, effects don't.</strong> Movement and size use <code>motion-spatial-*</code>; colour and opacity use <code>motion-effects-*</code>.</li>
          <li><strong>Every CTA points out.</strong> Filled and inverse buttons carry ↗. Text and tonal buttons don't.</li>
          <li><strong>Text on photography gets the scrim.</strong> Use <code>--scrim-media</code>, or the bottom scrim at compact.</li>
        </ol>
      </Section>

      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        icon={<Trash2 />}
        headline="Remove from library?"
        actions={<>
          <Button variant="text" onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="filled" trailingIcon={false} onClick={() => { setDialog(false); setSnack('Removed from library') }}>Remove</Button>
        </>}
      >
        "After Hours" will be removed from your library and your offline downloads. Playlists that include it won't change.
      </Dialog>
      {snack && <Snackbar message={snack} action="Undo" onClose={closeSnack} />}
    </div>
  )
}

