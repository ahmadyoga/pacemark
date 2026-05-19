'use client'
import type { StickerProps } from './types'

export function StickerSerif({ run, visible, accent }: StickerProps) {
  return (
    <div className="ovl ovl-serif" style={{ ['--accent' as string]: accent }}>
      <div className="ovl-serif-cap">a quiet<br />morning run.</div>
      <div className="ovl-serif-stats">
        {visible.distance && <span><b>{run.distance}</b> km</span>}
        {visible.pace && <span><b>{run.pace}</b>/km</span>}
        {visible.duration && <span><b>{run.duration}</b></span>}
      </div>
      <div className="ovl-serif-rule" />
      {visible.city && <div className="ovl-serif-foot">— {run.city}, ID</div>}
    </div>
  )
}
