'use client'
import type { StickerProps } from './types'

export function StickerBoldCaps({ run, visible, accent }: StickerProps) {
  const order: [string, string, string][] = []
  if (visible.duration) order.push(['TIME', run.duration.replace(':', '.'), 'MIN'])
  if (visible.distance) order.push(['KM', run.distance, 'KM'])
  if (visible.pace) order.push(['PACE', run.pace, '/KM'])
  if (order.length === 0) order.push(['KM', run.distance, 'KM'])

  return (
    <div className="ovl ovl-boldcaps" style={{ ['--accent' as string]: accent }}>
      {order.slice(0, 3).map((col, i) => (
        <div className="ovl-bc-col" key={col[0] + i}>
          <div className="ovl-bc-v">{col[1]}</div>
          <div className="ovl-bc-u">{col[2]}</div>
        </div>
      ))}
    </div>
  )
}
