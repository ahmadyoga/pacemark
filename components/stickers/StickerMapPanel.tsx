import { type StickerProps } from './types'
import { MapRoute } from './MapRoute'

export function StickerMapPanel({ run, accent }: StickerProps) {
  return (
    <div className="ovl ovl-mappanel">
      <div className="ovl-mp-map">
        <MapRoute seed={run.routeSeed} stroke={accent} strokeWidth={3} />
      </div>
      <div className="ovl-mp-panel">
        <div className="ovl-mp-city">{run.city.toUpperCase()}</div>
        <div className="ovl-mp-rows">
          <div className="ovl-mp-row">
            <span className="ovl-mp-k">DIST</span>
            <span className="ovl-mp-v" style={{ color: accent }}>{run.distance}<span className="ovl-mp-u"> km</span></span>
          </div>
          <div className="ovl-mp-row">
            <span className="ovl-mp-k">PACE</span>
            <span className="ovl-mp-v">{run.pace}</span>
          </div>
          <div className="ovl-mp-row">
            <span className="ovl-mp-k">TIME</span>
            <span className="ovl-mp-v">{run.duration}</span>
          </div>
          {run.elevation !== '0' && (
            <div className="ovl-mp-row">
              <span className="ovl-mp-k">ELEV</span>
              <span className="ovl-mp-v">+{run.elevation}<span className="ovl-mp-u"> m</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
