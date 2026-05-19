import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerElevation({ run, accent }: StickerProps) {
  const fg = accentFg(accent)
  // When accent is light (e.g. white) the chart line would be invisible on
  // the white card background — use a dark fallback colour for the stroke
  // while keeping the area fill at a low opacity so the accent hue still shows.
  const chartStroke = fg === '#000' ? 'rgba(0,0,0,0.55)' : accent
  const chartFill   = fg === '#000' ? 'rgba(0,0,0,0.08)'  : accent

  return (
    <div className="ovl ovl-elevation">
      <div className="ovl-elv-header">
        <div className="ovl-elv-title">ELEVATION PROFILE</div>
        <div className="ovl-elv-gain" style={{ color: chartStroke }}>+{run.elevation}m</div>
      </div>
      <div className="ovl-elv-chart">
        {/* Simplified mock chart path */}
        <svg viewBox="0 0 200 60" className="ovl-elv-svg">
          <path
            d="M0,60 L20,40 L40,45 L60,20 L80,30 L100,10 L120,25 L140,5 L160,15 L180,35 L200,60 Z"
            fill={chartFill}
            fillOpacity="0.2"
          />
          <path
            d="M0,60 L20,40 L40,45 L60,20 L80,30 L100,10 L120,25 L140,5 L160,15 L180,35 L200,60"
            fill="none"
            stroke={chartStroke}
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="ovl-elv-meta">
        <span>0km</span>
        <span>{run.distance}km</span>
      </div>
    </div>
  )
}
