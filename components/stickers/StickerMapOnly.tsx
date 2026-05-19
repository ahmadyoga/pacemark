import { type StickerProps } from './types'
import { MapRoute } from './MapRoute'

export function StickerMapOnly({ run, accent }: StickerProps) {
  return (
    <div className="ovl ovl-maponly">
      <div className="ovl-mo-route">
        <MapRoute seed={run.routeSeed} stroke={accent} strokeWidth={3} />
      </div>
      <div className="ovl-mo-city">{run.city.toUpperCase()}</div>
    </div>
  )
}
