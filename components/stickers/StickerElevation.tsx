import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerElevation({ run, accent }: StickerProps) {
  const fg = accentFg(accent)
  // When accent is light (e.g. white) the chart line would be invisible on
  // the white card background — use a dark fallback colour for the stroke
  // while keeping the area fill at a low opacity so the accent hue still shows.
  const chartStroke = fg === '#000' ? 'rgba(0,0,0,0.55)' : accent
  const chartFill   = fg === '#000' ? 'rgba(0,0,0,0.08)'  : accent

  const pts = run.elevationProfile
  const hasProfile = pts && pts.length >= 2

  let linePath = ''
  let areaPath = ''
  if (hasProfile) {
    linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
    const first = pts[0]
    const last = pts[pts.length - 1]
    areaPath = `${linePath} L${last[0]},60 L${first[0]},60 Z`
  }

  return (
    <div className="ovl ovl-elevation">
      <div className="ovl-elv-header">
        <div className="ovl-elv-title">ELEVATION PROFILE</div>
        <div className="ovl-elv-gain" style={{ color: chartStroke }}>+{run.elevation}m</div>
      </div>
      <div className="ovl-elv-chart">
        {hasProfile ? (
          <svg viewBox="0 0 200 60" className="ovl-elv-svg" preserveAspectRatio="none">
            <path d={areaPath} fill={chartFill} fillOpacity="0.2" />
            <path d={linePath} fill="none" stroke={chartStroke} strokeWidth="2" />
          </svg>
        ) : (
          <div className="ovl-elv-empty" style={{ color: chartStroke, opacity: 0.6 }}>
            No elevation data
          </div>
        )}
      </div>
      <div className="ovl-elv-meta">
        <span>0km</span>
        <span>{run.distance}km</span>
      </div>
    </div>
  )
}
