'use client'
import type { StickerProps } from './types'

export function StickerVHSPlayback({ run, visible }: StickerProps) {
  const isPortrait = visible.rounded
  return (
    <div className={`ovl ovl-vhs-play ${isPortrait ? 'is-portrait' : 'is-landscape'}`}>
      <div className="ovl-vhs-status">PLAY  ►</div>
      <div className="ovl-vhs-duration">{run.duration}</div>
      <div className="ovl-vhs-bottom-left">
        <div className="ovl-vhs-date">{run.date.toUpperCase()}</div>
      </div>
      <div className="ovl-vhs-channel">CH 03</div>
      <div className="ovl-vhs-scanlines" />
    </div>
  )
}
