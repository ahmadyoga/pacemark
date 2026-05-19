/**
 * Returns '#000' when the accent is a light color (e.g. white, yellow)
 * so that text placed on an accent-colored background stays readable.
 * Falls back to '#fff' for dark/saturated accents.
 */
export function accentFg(hex: string): string {
  const h = String(hex).replace('#', '')
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0')
  const n = parseInt(x.slice(0, 6), 16)
  if (Number.isNaN(n)) return '#fff'
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  // Weighted luminance (perceived brightness)
  return r * 299 + g * 587 + b * 114 > 148000 ? '#000' : '#fff'
}
