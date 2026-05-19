import { type StickerProps } from './types'
import { RouteLine } from '@/components/ui/RouteLine'

export function StickerRouteData({ run, accent }: StickerProps) {
  return (
    <div className="ovl ovl-routedata">
      <div className="ovl-rd-map">
        <RouteLine
          seed={run.routeSeed}
          height={120}
          stroke={accent}
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
      <div className="ovl-rd-foot" style={{ backgroundColor: accent }}>
        {run.city.toUpperCase()} · {run.title.toUpperCase()}
      </div>
    </div>
  )
}
