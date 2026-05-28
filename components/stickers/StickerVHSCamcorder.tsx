'use client'
import type { StickerProps } from './types'

export function StickerVHSCamcorder({ run, visible, accent }: StickerProps) {
  const isPortrait = visible.rounded // Reusing rounded prop for aspect ratio toggle for now
  return (
    <div className={`ovl ovl-vhs-cam ${isPortrait ? 'is-portrait' : 'is-landscape'}`}>
      <div className="ovl-vhs-rec">● REC</div>
      <div className="ovl-vhs-battery">[|||| ]</div>
      <div className="ovl-vhs-bottom-left">
        <div className="ovl-vhs-date">{run.date.toUpperCase()}</div>
        <div className="ovl-vhs-time">{run.startTime || '06:15:32 AM'}</div>
      </div>
      <div className="ovl-vhs-mode">SP</div>
      <div className="ovl-vhs-scanlines" />
    </div>
  )
}
