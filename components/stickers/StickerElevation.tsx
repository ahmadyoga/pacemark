import { type StickerProps } from './types'

export function StickerElevation({ run, accent }: StickerProps) {
  return (
    <div className="ovl ovl-elevation">
      <div className="ovl-elv-header">
        <div className="ovl-elv-title">ELEVATION PROFILE</div>
        <div className="ovl-elv-gain" style={{ color: accent }}>+{run.elevation}m</div>
      </div>
      <div className="ovl-elv-chart">
        {/* Simplified mock chart path */}
        <svg viewBox="0 0 200 60" className="ovl-elv-svg">
          <path 
            d="M0,60 L20,40 L40,45 L60,20 L80,30 L100,10 L120,25 L140,5 L160,15 L180,35 L200,60 Z" 
            fill={accent} 
            fillOpacity="0.2" 
          />
          <path 
            d="M0,60 L20,40 L40,45 L60,20 L80,30 L100,10 L120,25 L140,5 L160,15 L180,35 L200,60" 
            fill="none" 
            stroke={accent} 
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
