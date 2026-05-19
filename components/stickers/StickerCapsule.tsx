'use client'
import type { StickerProps } from './types'

export function StickerCapsule({ run, visible, accent }: StickerProps) {
  return (
    <div className="ovl ovl-capsule" style={{ ['--accent' as string]: accent }}>
      <div className="ovl-cap-pill">
        <span className="ovl-cap-pin" />
        <span className="ovl-cap-txt">{visible.city ? run.city.toUpperCase() : 'RUN'}</span>
        <span className="ovl-cap-div" />
        <span className="ovl-cap-num">{run.distance}<span>KM</span></span>
      </div>
      <div className="ovl-cap-sub">{run.date} · {run.title}</div>
    </div>
  )
}
