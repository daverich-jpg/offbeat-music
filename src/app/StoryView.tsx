import { useEffect, useRef } from 'react'
import { ArrowLeft, Bookmark, Share2 } from 'lucide-react'
import { Art, IconButton } from '../components'
import { api, keys, useResource } from './api'
import type { Story } from './data'

/**
 * The header renders from data the hero already had, so it can morph in on frame one
 * (same view-transition-names as the FeatureCard). Only the body may still be loading.
 */
export function StoryView({ story, onBack }: { story: Story; onBack: () => void }) {
  const full = useResource<Story>(keys.story(story.id), () => api.story(story.id))
  const root = useRef<HTMLElement>(null)

  // Move focus to Back so keyboard and screen-reader users land in the new view.
  useEffect(() => { root.current?.querySelector('button')?.focus({ preventScroll: true }) }, [story.id])

  return (
    <article className="story" aria-labelledby="story-title" ref={root}>
      <div className="story__bar">
        <IconButton label="Back to Discover" onClick={onBack}><ArrowLeft /></IconButton>
        <span className="ob-label-sm">{story.kicker}</span>
        <span className="story__bar-actions">
          <IconButton label="Save story"><Bookmark /></IconButton>
          <IconButton label="Share story"><Share2 /></IconButton>
        </span>
      </div>

      <header className="story__hero">
        <div className="story__media" style={{ viewTransitionName: 'story-media' }}>
          {/* Same photo as the Discover hero when there is one, so the morph is one continuous image. */}
          <Art tone={story.tone} src={story.wide?.image ?? story.image} placeholder={story.wide?.placeholder ?? story.placeholder} focus={story.wide?.focus ?? story.focus} priority />
        </div>
        <h1 id="story-title" className="story__headline" style={{ viewTransitionName: 'story-title' }}>
          {story.headline.map((l) => <span key={l}>{l}</span>)}
        </h1>
      </header>

      <div className="story__meta">
        <p className="ob-body-lg story__dek">{story.dek}</p>
        <p className="ob-label-sm">By {story.author} · {story.date} · {story.readTime}</p>
      </div>

      <div className="story__body" aria-busy={full.skeleton}>
        {full.skeleton ? (
          <div className="story__skeleton" aria-label="Loading story">
            {[100, 96, 98, 60, 0, 100, 94, 88].map((w, i) =>
              w ? <span key={i} className="skel skel--line" style={{ width: `${w}%`, height: 14, ['--i' as string]: i }} /> : <span key={i} style={{ height: 12 }} />)}
          </div>
        ) : (
          full.data?.body.map((p, i) => <p key={i} className="ob-body-lg story__para" style={{ ['--i' as string]: i }}>{p}</p>)
        )}
      </div>
    </article>
  )
}
