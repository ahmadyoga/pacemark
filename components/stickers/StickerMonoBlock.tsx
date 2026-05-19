'use client'
import type { StickerProps } from './types'
import { statList } from './types'

export function StickerMonoBlock({ run, visible, accent }: StickerProps) {
  const stats = statList(run, visible)
  return (
    <div className="ovl ovl-mono" style={{ ['--accent' as string]: accent }}>
      <div className="ovl-mono-head">
        <span className="ovl-mono-dot" />
        <span>{run.date} · {visible.city ? run.city.toUpperCase() : 'RUN'}</span>
      </div>
      <div className="ovl-mono-rows">
        {stats.slice(0, 5).map(([k, v]) => (
          <div className="ovl-mono-row" key={k}>
            <span className="ovl-mono-k">{k}</span>
            <span className="ovl-mono-dots" />
            <span className="ovl-mono-v">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
