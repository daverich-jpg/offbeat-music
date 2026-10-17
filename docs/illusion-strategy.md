# UX Illusion Strategy: Discover

How the Discover screen hides waiting, and what happens when the illusion breaks. Written with the ux-magic-and-illusions framework; every value comes from the design system's tokens.

## 1. The magic effect
The user sees a feed that is always there, chips that switch instantly, music that starts the moment they tap, and a story that grows out of the card they tapped. Underneath: three network calls on load, a fetch per filter, a stream that takes ~350ms to start, and a story body that loads separately.

## 2. Illusion architecture
| Friction | Mechanism | Where |
|---|---|---|
| First load (~900ms) | **Layout-true skeletons.** Static copy (headline, chips) paints on frame one. Skeletons share the real geometry, with a shimmer sweeping left to right, staggered 90ms. Photos blur up from 16px placeholders. | `Discover.tsx` `FeedSkeleton`, `Art` |
| Filter switch | **Anticipatory loading.** Chips prefetch on hover or focus. Cached feeds swap with a 200ms fade. Uncached ones keep the old content dimmed for a 250ms budget before skeletons appear, then rise in, staggered 50ms. | `api.ts` `useResource`, `Discover.tsx` |
| Hard cut to an article | **Shared-element morph.** The hero media and headline carry `view-transition-name`s that the story header reuses, so they morph while the sidebar and right column stay still. Story text is prefetched when you hover or focus "Read the story". | `FeatureCard transitionName`, `StoryView.tsx`, `App.tsx transition()` |
| Stream start latency | **Optimistic play.** Snapshot the player, flip the UI on the same tick, start the stream in the background. | `App.tsx play()` |
| Search context switch | **Focal dampening.** Everything except the search panel drops to 30% opacity with a 3px blur. Results come from a local index, so they appear as you type. Recent searches persist in localStorage. | `TopBar.tsx`, `app.css [data-searching]` |
| Unread badge | Optimistic clear when the panel opens; `markRead` syncs in the background. | `TopBar.tsx Notifications` |
| The prestige | The first play brings in the mini player on a spatial spring. Equalizers replace track numbers, and the radio's waveform comes alive. | `app.css .app__player`, `Equalizer`, `Waveform live` |

## 3. Motion spec
- Reveal: `--motion-enter` (400ms, emphasized decelerate), staggered 50ms per item.
- Cached swap and dimming: `--motion-effects-default` (200ms, no overshoot).
- Morph: media and title groups 500ms on the spatial-default curve; the root crossfades over 220ms.
- Mini player entrance: `--motion-spatial-default`.
- Reduced motion: no morph (instant route change), no shimmer, no equalizer or waveform animation, and spatial tokens collapse to 1ms.

## 4. Breaking the illusion gracefully
- **Stream fails:** restore the player snapshot (including hiding the mini player if nothing was playing before) and show the snackbar "Couldn't play "X"" with **Retry**. Try it with `?chaos`, which fails 50% of stream starts.
- **Feed fails:** an inline "This feed didn't load" message with Try again; the chips stay usable.
- **markRead fails:** the badge comes back and a snackbar explains why.
- **No View Transitions API:** a plain route swap. Focus moves to Back when a story opens and to "Read the story" on return, so keyboard users never lose their place.
