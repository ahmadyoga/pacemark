import { type StickerProps } from './types'

/**
 * Bare elevation silhouette — no card wrapper, just the SVG (or an empty-state span).
 * Sized via `.ovl-sum-svg` so the captured PNG has a known box.
 */
export function StickerSummit({ run, accent }: StickerProps) {
  const pts = run.elevationProfile

  if (!pts || pts.length < 2) {
    return <span className="ovl-sum-empty">No elevation data</span>
  }

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const first = pts[0]
  const last = pts[pts.length - 1]
  const areaPath = `${linePath} L${last[0]},60 L${first[0]},60 Z`

  return (
    <svg viewBox="0 0 200 60" preserveAspectRatio="none" className="ovl-sum-svg">
      <defs>
        <linearGradient id="sumfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={accent} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sumfill)" />
      <path d={linePath} fill="none" stroke={accent} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}
