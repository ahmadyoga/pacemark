import { type StickerProps } from './types'
import { MapRoute } from './MapRoute'
import { accentFg } from './accentFg'

export function StickerRouteData({ run, accent }: StickerProps) {
  const fg = accentFg(accent)
  return (
    <div className="ovl ovl-routedata">
      <div className="ovl-rd-map">
        <MapRoute
          points={run.routePoints}
          stroke={accent}
          strokeWidth={2}
        />
      </div>
      <div className="ovl-rd-main">
        <div className="ovl-rd-dist">
          <span className="ovl-rd-v">{run.distance}</span>
          <span className="ovl-rd-u" style={{ color: accent }}>KM</span>
        </div>
        <div className="ovl-rd-meta">
          <div className="ovl-rd-row">
            <span className="ovl-rd-rk">PACE</span>
            <span className="ovl-rd-rv">{run.pace}</span>
          </div>
          <div className="ovl-rd-row">
            <span className="ovl-rd-rk">TIME</span>
            <span className="ovl-rd-rv">{run.duration}</span>
          </div>
        </div>
      </div>
      <div className="ovl-rd-foot" style={{ backgroundColor: accent, color: fg }}>
        {run.city.toUpperCase()} · {run.title.toUpperCase()}
      </div>
    </div>
  )
}

