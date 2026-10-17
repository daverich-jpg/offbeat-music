# Offbeat — design system

v0.2. Values are extracted from Figma `3foIRpj43mwJx4JOhrMSUC` node `1277:184`; the structure follows Material 3. Colours are pixel-sampled from a 1:1 render; type sizes are measured from cap heights.

```
npm run dev        # app on http://localhost:5270, style guide at /styleguide.html
npm run contrast   # checks every intended role pairing (AA); also runs in build
npm run build
```

- `src/tokens/tokens.css`: primitives (Graphite, Volt, Signal) → M3 colour roles, state layers, elevation, shape scale, type roles, spring motion and layout. Components read only roles.
- `src/tokens/breakpoints.ts`: M3 breakpoints and the navigation component used at each one.
- `src/components/`: 21 React components, with `styles.css` (`@layer ob-components`, `ob-` classes). Add `ob-interactive` to get state layers and press feedback, and `ob-target` to get a 48px hit area.
- `src/components/player.tsx`: the Now playing pattern: `usePlayback` (simulated clock and queue; swap in a real audio engine later), `MiniPlayer` and `NowPlaying`. These sit on `BottomSheet` (M3 modal sheet with drag to dismiss), which fills its nearest positioned ancestor; give the app's viewport-height root the `ob-sheet-host` class.
- `src/app/`: the Discover app built on the system (layout, mock API, story view, search, notifications). See `docs/illusion-strategy.md` for the perceived-performance design. `?chaos` fails half of all stream starts to demo rollback.
- `public/media/`: photos cropped from the Figma reference render, temporary until real assets are exported.
- `src/styleguide/`: the living guide, including the adaptive reference screen and the M3 alignment table (adopted / adapted / added / deviation / open).

Open decisions: light scheme; a docked desktop player bar (≥840px); optical-roundness deviation on media card artwork; the components not built yet (FAB, side sheets, pickers, carousel, toolbar, split button, button group, segmented button).
