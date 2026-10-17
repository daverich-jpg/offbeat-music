import { Pause, Play } from 'lucide-react'
import { Art, PromoCard, TrackRow } from '../components'
import { api, keys, useResource } from './api'
import type { Track } from '../components'

export function RightRail({ radioLive, onTuneIn, onPlayTrack, currentId, playing }: {
  radioLive: boolean
  onTuneIn: () => void
  onPlayTrack: (index: number) => void
  currentId?: string
  playing: boolean
}) {
  const repeat = useResource<Track[]>(keys.repeat, api.onRepeat)
  return (
    <aside className="app__aside" aria-label="Radio and your top tracks">
      <PromoCard
        title="Not on the FM."
        body="For the ones who listen a little differently."
        cta={radioLive ? 'Live now · Pause' : 'Tune in'}
        ctaIcon={radioLive ? <Pause strokeWidth={2} /> : <Play strokeWidth={2} />}
        live={radioLive}
        onCta={onTuneIn}
        footnote="Original studio previews, always exploring."
      />
      <div className="rail__repeat">
        <div className="ob-section-header">
          <h2 className="ob-title-md">On repeat</h2>
          <span className="ob-body-sm">This week</span>
        </div>
        <ul className="ob-list" aria-busy={repeat.skeleton}>
          {repeat.skeleton || !repeat.data
            ? [0, 1, 2].map((i) => (
                <li key={i} className="ob-track rail__skel" style={{ ['--i' as string]: i }}>
                  <span className="skel skel--line" style={{ width: 14, height: 10 }} />
                  <span className="skel" style={{ width: 32, height: 40, borderRadius: 4 }} />
                  <span style={{ display: 'grid', gap: 6 }}>
                    <span className="skel skel--line" style={{ width: 80, height: 11 }} />
                    <span className="skel skel--line" style={{ width: 54, height: 9 }} />
                  </span>
                </li>
              ))
            : repeat.data.map((t, i) => (
                <TrackRow
                  key={t.id}
                  index={i + 1}
                  title={t.title}
                  genre={t.artist}
                  art={<Art tone={t.tone} src={t.image} placeholder={t.placeholder} />}
                  current={t.id === currentId}
                  playing={playing}
                  onPlay={() => onPlayTrack(i)}
                />
              ))}
        </ul>
      </div>
    </aside>
  )
}
