import { type StickerProps } from './types'
import { MapRoute } from './MapRoute'

export function StickerMapStats({ run, accent }: StickerProps) {
  return (
    <div className="ovl ovl-mapstats">
      <div className="ovl-ms-route">
        <MapRoute seed={run.routeSeed} stroke={accent} strokeWidth={2.5} />
      </div>
      <div className="ovl-ms-bar">
        <div className="ovl-ms-stat">
          <span className="ovl-ms-v">{run.distance}</span>
          <span className="ovl-ms-u">KM</span>
        </div>
        <div className="ovl-ms-div" />
        <div className="ovl-ms-stat">
          <span className="ovl-ms-v">{run.pace}</span>
          <span className="ovl-ms-u">/KM</span>
        </div>
        <div className="ovl-ms-div" />
        <div className="ovl-ms-stat">
          <span className="ovl-ms-v">{run.duration}</span>
          <span className="ovl-ms-u">TIME</span>
        </div>
      </div>
    </div>
  )
}
