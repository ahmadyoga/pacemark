'use client'
import type { StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerChat({ run, visible, accent }: StickerProps) {
  const fg = accentFg(accent)
  const headline = visible.distance
    ? `just ran ${run.distance} km`
    : `ran a ${run.title.toLowerCase()}`
  const sub = [
    visible.duration && `${run.duration} total`,
    visible.pace && `${run.pace}/km`,
  ].filter(Boolean).join(' · ')

  return (
    <div className="ovl ovl-chat" style={{ ['--accent' as string]: accent, ['--accent-fg' as string]: fg }}>
      <div className="ovl-chat-bubble">
        <div className="ovl-chat-msg">{headline}</div>
        {sub && <div className="ovl-chat-sub">{sub}</div>}
        <div className="ovl-chat-tail" />
      </div>
      <div className="ovl-chat-meta">
        <span className="ovl-chat-avatar">PM</span>
        <span>pacemark · 2m</span>
      </div>
    </div>
  )
}
