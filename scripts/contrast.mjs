// Contrast gate: resolves role tokens from tokens.css and checks every intended M3 pairing.
// Text pairs need 4.5:1, non-text boundaries 3:1. Exits 1 on any failure.
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/tokens/tokens.css', import.meta.url), 'utf8')
const root = css.slice(0, css.indexOf('@media'))
const vars = Object.fromEntries([...root.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
const resolve = (name) => {
  let v = vars[name]
  while (v?.startsWith('var(')) v = vars[v.slice(6, -1)]
  if (!/^#[0-9a-f]{6}$/i.test(v ?? '')) throw new Error(`--${name} does not resolve to a hex colour`)
  return v
}
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

const T = 4.5, UI = 3
const pairs = [
  ['on-primary', 'primary', T], ['on-primary-variant', 'primary', T], ['on-primary-container', 'primary-container', T],
  ['primary', 'primary-container', T], ['on-secondary-container', 'secondary-container', T],
  ['on-error', 'error', T], ['on-error-container', 'error-container', T],
  ...['surface', 'surface-container-low', 'surface-container', 'surface-container-high', 'surface-container-highest'].flatMap((s) => [
    ['on-surface', s, T], ['on-surface-variant', s, T], ['primary', s, T], ['error', s, T],
  ]),
  ['outline', 'surface', UI], ['outline', 'surface-container-high', UI],
  ['inverse-on-surface', 'inverse-surface', T], ['inverse-primary', 'inverse-surface', T],
]

let fail = 0
for (const [fg, bg, min] of pairs) {
  const r = ratio(resolve(`color-${fg}`), resolve(`color-${bg}`))
  const ok = r >= min
  if (!ok) fail++
  console.log(`${ok ? '✓' : '✗'} ${fg.padEnd(24)} on ${bg.padEnd(26)} ${r.toFixed(2).padStart(5)} (min ${min})`)
}
console.log(fail ? `\n${fail} pairing(s) below threshold` : `\nAll ${pairs.length} pairings pass`)
process.exit(fail ? 1 : 0)
