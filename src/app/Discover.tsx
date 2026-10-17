import { useEffect, useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { Art, Button, Chip, Equalizer, FeatureCard, MediaCard, SectionHeader, type Track } from '../components'
import { api, keys, useResource } from './api'
import { filters, type Feed, type Filter, type Story } from './data'

export function Discover({ onOpenStory, onPlay, nowSource, playing }: {
  onOpenStory: (s: Story) => void
  onPlay: (queue: Track[], index?: number) => void
  nowSource?: string
  playing: boolean
}) {
  const [filter, setFilter] = useState<Filter>('For you')
  const feed = useResource<Feed>(keys.feed(filter), () => api.feed(filter))

  // How new content enters: 'rise' after a visible wait, 'swap' for an instant cached switch,
  // nothing on remount (e.g. returning from a story, where the view transition does the work).
  const waited = useRef(false)
  const shownStory = useRef<string | undefined>(undefined)
  if (feed.skeleton || feed.dimmed) waited.current = true
  const storyId = feed.data?.story.id
  const animate = waited.current ? 'rise' : shownStory.current && shownStory.current !== storyId ? 'swap' : undefined
  useEffect(() => {
    if (!feed.skeleton && !feed.dimmed && storyId) { shownStory.current = storyId; waited.current = false }
  })

  return (
    <div className="discover">
      {/* Static copy renders on the first frame: text before rich assets. */}
      <header className="discover__intro">
        <h1 className="ob-headline-lg discover__title">Find your next obsession</h1>
        <p className="ob-body-md">Fresh sounds. Real stories. Culture that moves you.</p>
        <div className="ob-chip-group discover__chips" role="group" aria-label="Filter">
          {filters.map((f) => (
            <Chip
              key={f}
              selected={filter === f}
              onClick={() => setFilter(f)}
              // Anticipatory loading: by the time the click lands, the feed is usually cached.
              onPointerEnter={() => api.feed(f)}
              onFocus={() => api.feed(f)}
            >
              {f}
            </Chip>
          ))}
        </div>
      </header>

      <div className="discover__feed" data-dimmed={feed.dimmed || undefined} aria-busy={feed.skeleton || feed.dimmed}>
        {feed.error ? (
          <div className="discover__error" role="alert">
            <p className="ob-body-md">This feed didn't load.</p>
            <Button variant="tonal" trailingIcon={false} onClick={feed.retry}>Try again</Button>
          </div>
        ) : feed.skeleton || !feed.data ? (
          <FeedSkeleton />
        ) : (
          // Keyed by content so each new feed replays the staggered reveal.
          <div className="discover__reveal" key={feed.data.story.id} data-animate={animate}>
            <div style={{ ['--i' as string]: 0 }}>
              <FeatureCard
                headline={feed.data.story.headline}
                body={feed.data.story.dek}
                cta="Read the story"
                meta={feed.data.story.readTime}
                media={<HeroMedia story={feed.data.story} />}
                transitionName="story"
                onCta={() => onOpenStory(feed.data!.story)}
                onCtaIntent={() => api.story(feed.data!.story.id)}
              />
            </div>

            <div style={{ ['--i' as string]: 1 }}><SectionHeader title="Made for Misugla" action="See all" /></div>
            <div className="discover__grid">
              {feed.data.mixes.map((m, i) => {
                const active = nowSource === m.title
                return (
                  <div key={m.id} style={{ ['--i' as string]: i + 2 }}>
                    <MediaCard
                      title={m.title}
                      subtitle={m.subtitle}
                      label={`${active && playing ? 'Playing' : 'Play'} ${m.title}: ${m.subtitle}`}
                      active={active}
                      art={<Art tone={m.tone} src={m.image} placeholder={m.placeholder} focus={m.focus} />}
                      badge={<span className="discover__play">{active ? <Equalizer playing={playing} /> : <Play fill="currentColor" />}</span>}
                      onClick={() => onPlay(m.tracks)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * A card-shaped photo fills the hero edge to edge, as in the design. Stories with only a
 * smaller photo anchor it right and fade it into the dark, so it is never stretched.
 */
function HeroMedia({ story }: { story: Story }) {
  const wide = story.wide
  return (
    <div className="discover__hero-media" data-fit={wide ? 'fill' : 'side'}>
      {wide
        ? <Art tone={story.tone} src={wide.image} placeholder={wide.placeholder} focus={wide.focus} priority />
        : <Art tone={story.tone} src={story.image} placeholder={story.placeholder} focus={story.focus} priority />}
    </div>
  )
}

/** Mirrors the final layout exactly, so the swap to real content doesn't shift anything. */
function FeedSkeleton() {
  return (
    <div className="discover__reveal discover__reveal--skeleton" aria-label="Loading feed">
      <div className="skel skel--hero" style={{ ['--i' as string]: 0 }}>
        <span className="skel skel--line" style={{ width: 220, height: 32 }} />
        <span className="skel skel--line" style={{ width: 260, height: 32 }} />
        <span className="skel skel--line" style={{ width: 240, height: 14, marginTop: 8 }} />
        <span className="skel skel--line" style={{ width: 140, height: 38, marginTop: 20, borderRadius: 999 }} />
      </div>
      <div className="skel skel--line" style={{ width: 150, height: 16, ['--i' as string]: 1 }} />
      <div className="discover__grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skel skel--card" style={{ ['--i' as string]: i + 2 }}>
            <span className="skel skel--art" />
            <span className="skel skel--line" style={{ width: '50%', height: 14 }} />
            <span className="skel skel--line" style={{ width: '75%', height: 10 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
