import { type StickerProps } from './types'
import { MapRoute } from './MapRoute'

export function StickerMapPure({ run, accent }: StickerProps) {
  return (
    <div className="ovl ovl-mappure">
      <MapRoute points={run.routePoints} stroke={accent} strokeWidth={2} />
    </div>
  )
}
