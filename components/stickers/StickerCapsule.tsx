'use client'
import type { StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerCapsule({ run, visible, accent }: StickerProps) {
  const fg = accentFg(accent)
  return (
    <div className="ovl ovl-capsule" style={{ ['--accent' as string]: accent, ['--accent-fg' as string]: fg }}>
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
