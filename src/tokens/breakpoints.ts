/** M3 breakpoints (dp = CSS px on the web). Mirrors the Layout notes in tokens.css. */
export const breakpoints = {
  compact: 0,
  medium: 600,
  expanded: 840,
  large: 1200,
  extraLarge: 1600,
} as const

export type Breakpoint = keyof typeof breakpoints

/** Which navigation component each breakpoint uses. */
export const navigationFor: Record<Breakpoint, 'bar' | 'rail' | 'sidebar'> = {
  compact: 'bar',
  medium: 'rail',
  expanded: 'rail',
  large: 'sidebar',
  extraLarge: 'sidebar',
}
