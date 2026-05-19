import { type StickerProps } from './types'

export function StickerVerticalRun({ run }: StickerProps) {
  return (
    <div className="ovl ovl-vertrun">
      <div className="ovl-vr-meta">{run.date} · {run.title}</div>
      <div className="ovl-vr-num">{run.distance}<span className="ovl-vr-unit">km</span></div>
      <div className="ovl-vr-num">{run.pace}<span className="ovl-vr-unit">/km</span></div>
      <div className="ovl-vr-num">{run.duration}</div>
    </div>
  )
}
