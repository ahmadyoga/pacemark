'use client'
import { useRef, useState } from 'react'
import { stickerToBlob, downloadBlob, copyBlobToClipboard } from '@/lib/export'
import type { DisplayActivity } from '@/lib/strava'
import type { StickerDef, VisibleMetrics } from '@/components/stickers'

interface StickerTileProps {
  def: StickerDef
  run: DisplayActivity
  visible: VisibleMetrics
  accent: string
  bg: 'dark' | 'light' | 'checker'
}

export function StickerTile({ def, run, visible, accent, bg }: StickerTileProps) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'working' | 'done'>('idle')

  const Comp = def.comp

  async function handleCopy() {
    if (!captureRef.current) return
    try {
      const blob = await stickerToBlob(captureRef.current)
      await copyBlobToClipboard(blob)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      if (captureRef.current) {
        const blob = await stickerToBlob(captureRef.current)
        downloadBlob(blob)
      }
    }
  }

  async function handleSave() {
    if (!captureRef.current) return
    setSaveState('working')
    try {
      const blob = await stickerToBlob(captureRef.current)
      downloadBlob(blob)
      setSaveState('done')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div className="tile">
      <div className="tile-head">
        <div className="tile-name">{def.name}</div>
        <div className="tile-desc">{def.desc}</div>
      </div>
      <div className={`tile-stage tile-stage-${bg}`}>
        <div className="tile-stage-inner">
          <Comp run={run} visible={visible} accent={accent} />
        </div>
      </div>
      <div
        ref={captureRef}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: 0, left: 0 }}
        aria-hidden="true"
      >
        <Comp run={run} visible={visible} accent={accent} />
      </div>
      <div className="tile-actions">
        <button
          className={`tile-btn tile-btn-copy ${copied ? 'is-done' : ''}`}
          onClick={handleCopy}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          className={`tile-btn tile-btn-save ${saveState !== 'idle' ? 'is-active' : ''}`}
          onClick={handleSave}
        >
          {saveState === 'working'
            ? 'Saving…'
            : saveState === 'done'
            ? 'Saved'
            : 'PNG'}
        </button>
      </div>
    </div>
  )
}
