import type { Track } from '../components'
import lqip from './lqip.json'

/** Where each photo's subject is, so wide or tall crops never cut off a face. */
const focus: Record<keyof typeof lqip, string> = {
  hero: '62% 6%',
  'hero-wide': '77% 4%',
  'mix-01': '45% 30%',
  'mix-02': '62% 35%',
  'mix-03': '50% 50%',
  avatar: '50% 50%',
}

const media = (name: keyof typeof lqip) => ({ image: `./media/${name}.webp`, placeholder: lqip[name], focus: focus[name] })

export type Filter = 'For you' | 'Music' | 'Culture' | 'New releases' | 'Playlist'
export const filters: Filter[] = ['For you', 'Music', 'Culture', 'New releases', 'Playlist']

export type Story = {
  id: string
  kicker: string
  headline: string[]
  dek: string
  readTime: string
  author: string
  date: string
  image?: string
  placeholder?: string
  focus?: string
  /** Optional full-bleed photo for the Discover hero card (card-shaped, ~2.7:1). */
  wide?: { image: string; placeholder: string; focus: string }
  tone: 1 | 2 | 3 | 4
  body: string[]
}

export type Mix = { id: string; title: string; subtitle: string; image?: string; placeholder?: string; focus?: string; tone: 1 | 2 | 3 | 4; tracks: Track[] }
export type Feed = { story: Story; mixes: Mix[] }
export type Notification = { id: string; title: string; detail: string; when: string }

/* ─── Tracks ─── */

const t = (id: string, title: string, artist: string, duration: number, tone: Track['tone'], tint: string, art?: ReturnType<typeof media>): Track =>
  ({ id, title, artist, source: '', duration, tone, tint, ...art })

export const tracks = {
  afterHours: t('after-hours', 'After Hours', 'Nala Sky', 214, 4, '#9a3a30', media('mix-01')),
  lagosHeat: t('lagos-heat', 'Lagos Heat', 'Tems Adebayo', 187, 2, '#4a6a9a', media('mix-02')),
  feverGlass: t('fever-glass', 'Fever Glass', 'Ochre', 243, 3, '#e2475f', media('mix-03')),
  slowBurn: t('slow-burn', 'Slow Burn', 'Kofi Amari', 198, 1, '#7a6a55', media('mix-01')),
  rooftop: t('rooftop', 'Rooftop Static', 'The Low End', 226, 2, '#4a6a9a', media('mix-02')),
  halflight: t('halflight', 'Halflight', 'Ines Varga', 201, 3, '#e2475f', media('mix-03')),
  underground: t('underground', 'Underground Hymn', 'Nala Sky', 262, 4, '#9a3a30', media('hero')),
  noSignal: t('no-signal', 'No Signal', 'Ochre', 175, 1, '#7a6a55'),
}

const withSource = (list: Track[], source: string) => list.map((x) => ({ ...x, source }))

export const onRepeat: Track[] = withSource([tracks.afterHours, tracks.lagosHeat, tracks.feverGlass], 'On repeat')

export const radio: Track[] = withSource([tracks.underground, tracks.noSignal, tracks.halflight], 'Offbeat radio')

/* ─── Stories ─── */

const newWave: Story = {
  id: 'a-new-wave',
  kicker: 'Culture · Feature',
  headline: ['A new wave.', 'A louder future.'],
  dek: 'Meet the women reshaping the underground, one dancefloor at a time.',
  readTime: '8 min read',
  author: 'Adaeze Obi',
  date: '14 Oct 2026',
  tone: 4,
  ...media('hero'),
  wide: media('hero-wide'),
  body: [
    'It is 2am in a basement with no sign on the door, and the room has stopped talking. The DJ hasn\'t touched the mixer in thirty seconds. She is letting a single kick drum hold four hundred people in place, and when the bassline finally lands, the floor moves as one body.',
    'Five years ago, nights like this were booked by the same dozen names. Now the lineups are being rewritten by women who learned on borrowed decks, built crews out of group chats, and treated every set as an argument for a different kind of night out.',
    '"Nobody was going to hand us the room," says one resident, who started throwing parties in a laundromat after-hours. "So we built rooms. Then people started following the rooms instead of the headliners."',
    'The sound is hard to pin down, and that is the point. Amapiano log drums sit under Detroit chords. Jersey club breaks are pitched down until they feel like weather. The common thread is patience: sets that take their time and trust the crowd to come with them.',
    'What happens next is already visible in the booking calendars. The crews that started in back rooms are curating festival stages, running mentorship programmes, and pressing their own records. The underground hasn\'t gone mainstream. The mainstream has started listening to it.',
  ],
}

const story = (id: string, kicker: string, headline: string[], dek: string, tone: Story['tone'], art?: ReturnType<typeof media>): Story => ({
  id, kicker, headline, dek, tone, ...art,
  readTime: '5 min read',
  author: 'Offbeat Editors',
  date: '12 Oct 2026',
  body: [
    `${dek} We spent a month with the people making it happen, in studios, on rooftops and in the long hours between.`,
    'The pattern was the same everywhere we went: small rooms, generous people, and a refusal to wait for permission. Most of what we heard hasn\'t been released yet. Some of it never will be.',
    'This is a scene you have to show up for, so consider this an invitation.',
  ],
})

/* ─── Feeds, one per filter ─── */

const mix = (id: string, title: string, subtitle: string, tone: Mix['tone'], list: Track[], art?: ReturnType<typeof media>): Mix =>
  ({ id, title, subtitle, tone, ...art, tracks: withSource(list, title) })

export const feeds: Record<Filter, Feed> = {
  'For you': {
    story: newWave,
    mixes: [
      mix('daily-01', 'Daily mix 01', 'Meet the new voices rewriting R&B', 1, [tracks.afterHours, tracks.slowBurn, tracks.halflight], media('mix-01')),
      mix('daily-02', 'Daily mix 02', 'Fresh frequencies', 2, [tracks.lagosHeat, tracks.rooftop, tracks.noSignal], media('mix-02')),
      mix('daily-03', 'Daily mix 03', 'The night belongs to us', 3, [tracks.feverGlass, tracks.underground, tracks.afterHours], media('mix-03')),
    ],
  },
  Music: {
    story: story('quiet-room', 'Music · Studio visit', ['The quiet room.', 'Where R&B gets rewritten.'], 'Inside the late-night studios where a new generation is slowing everything down.', 1, media('mix-01')),
    mixes: [
      mix('slow-hours', 'Slow hours', 'Late-night R&B, unhurried', 1, [tracks.slowBurn, tracks.afterHours], media('mix-01')),
      mix('low-end', 'Low end theory', 'Bass-forward and patient', 4, [tracks.underground, tracks.noSignal]),
      mix('glass', 'Glasshouse', 'Bright, brittle, beautiful', 3, [tracks.feverGlass, tracks.halflight], media('mix-03')),
    ],
  },
  Culture: {
    story: story('rooftops', 'Culture · Scene report', ['Rooftops after dark.', 'The parties with no address.'], 'The crews turning city skylines into the most exclusive dancefloors in town.', 2, media('mix-02')),
    mixes: [
      mix('rooftop-sessions', 'Rooftop sessions', 'Recorded live, above the city', 2, [tracks.rooftop, tracks.lagosHeat], media('mix-02')),
      mix('crew-picks', 'Crew picks', 'Chosen by the people throwing the party', 4, [tracks.underground, tracks.afterHours], media('hero')),
      mix('after-party', 'After the party', 'For the walk home', 1, [tracks.halflight, tracks.slowBurn]),
    ],
  },
  'New releases': {
    story: story('fever-glass', 'New release · Review', ['Fever Glass.', 'Out now, and out there.'], 'Ochre\'s debut sounds like a heat haze. We have had it on repeat all week.', 3, media('mix-03')),
    mixes: [
      mix('new-this-week', 'New this week', 'Fresh out of the studio', 3, [tracks.feverGlass, tracks.lagosHeat], media('mix-03')),
      mix('first-listen', 'First listen', 'Debuts worth your time', 2, [tracks.noSignal, tracks.rooftop]),
      mix('rising', 'Rising', 'Names you will know next year', 1, [tracks.slowBurn, tracks.halflight], media('mix-01')),
    ],
  },
  Playlist: {
    story: story('how-we-listen', 'Playlists · Essay', ['How we listen now.', 'In defence of the long playlist.'], 'Why the best playlists are closer to radio than to a shuffle button.', 2),
    mixes: [
      mix('commute', 'Commute', 'Door to desk, no skips', 2, [tracks.lagosHeat, tracks.rooftop], media('mix-02')),
      mix('focus', 'Deep focus', 'Low lyrics, high attention', 1, [tracks.halflight, tracks.noSignal]),
      mix('sunday', 'Sunday reset', 'Slow start, good mood', 3, [tracks.slowBurn, tracks.feverGlass], media('mix-03')),
    ],
  },
}

export const notifications: Notification[] = [
  { id: 'n1', title: 'Nala Sky dropped a new single', detail: '"Underground Hymn" is out now', when: '2h' },
  { id: 'n2', title: 'Your Daily mixes are fresh', detail: '3 mixes updated for today', when: '6h' },
  { id: 'n3', title: 'Not on the FM is live', detail: 'Studio previews, every Friday', when: '1d' },
]

/* ─── Local search index (no network: results appear as you type) ─── */

export type SearchHit =
  | { kind: 'track'; id: string; title: string; detail: string; track: Track }
  | { kind: 'mix'; id: string; title: string; detail: string; mix: Mix }
  | { kind: 'story'; id: string; title: string; detail: string; story: Story }

const allMixes = Object.values(feeds).flatMap((f) => f.mixes)
const allStories = Object.values(feeds).map((f) => f.story)
const index: SearchHit[] = [
  ...Object.values(tracks).map((x): SearchHit => ({ kind: 'track', id: x.id, title: x.title, detail: `Track · ${x.artist}`, track: { ...x, source: 'Search' } })),
  ...allMixes.map((m): SearchHit => ({ kind: 'mix', id: m.id, title: m.title, detail: `Mix · ${m.subtitle}`, mix: m })),
  ...allStories.map((s): SearchHit => ({ kind: 'story', id: s.id, title: s.headline.join(' '), detail: `Story · ${s.kicker}`, story: s })),
]

export function search(query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return index
    .filter((h) => h.title.toLowerCase().includes(q) || h.detail.toLowerCase().includes(q))
    .sort((a, b) => Number(!a.title.toLowerCase().startsWith(q)) - Number(!b.title.toLowerCase().startsWith(q)))
    .slice(0, 6)
}

export const trending = ['Nala Sky', 'Amapiano', 'Rooftop sessions', 'Fever Glass']
