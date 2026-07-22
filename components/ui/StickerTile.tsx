'use client'
import { useRef, useState } from 'react'
import { stickerToBlob, downloadBlob, copyBlobToClipboard, shareBlobFile, stickerFilename } from '@/lib/export'
import type { DisplayActivity } from '@/lib/strava'
import type { StickerDef, VisibleMetrics } from '@/components/stickers'

interface StickerTileProps {
  def: StickerDef
  run: DisplayActivity
  visible: VisibleMetrics
  accent: string
}

export function StickerTile({ def, run, visible, accent }: StickerTileProps) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [copyLabel, setCopyLabel] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'working' | 'done'>('idle')
  const [rounded, setRounded] = useState(false)

  const Comp = def.comp
  const hasRounding = def.id === 'glowsplits' || def.id === 'pacesplits' || def.id === 'barsplits'
  const filename = stickerFilename({ stickerId: def.id, title: run.title, distance: run.distance })

  async function handleCopy() {
    if (!captureRef.current) return
    let blob: Blob
    try {
      blob = await stickerToBlob(captureRef.current)
    } catch {
      return
    }
    try {
      await copyBlobToClipboard(blob)
      setCopyLabel('Copied')
    } catch {
      try {
        await shareBlobFile(blob, filename)
        setCopyLabel('Shared')
      } catch {
        downloadBlob(blob, filename)
        setCopyLabel('Saved')
      }
    }
    setTimeout(() => setCopyLabel(''), 1800)
  }

  async function handleSave() {
    if (!captureRef.current) return
    setSaveState('working')
    try {
      const blob = await stickerToBlob(captureRef.current)
      downloadBlob(blob, filename)
      setSaveState('done')
      setTimeout(() => setSaveState('idle'), 1500)
    } catch {
      setSaveState('idle')
    }
  }

  return (
    <div className="tile">
      <div className="tile-head">
        <div className="tile-name-wrap">
          <div className="tile-name">{def.name}</div>
          <div className="tile-desc">{def.desc}</div>
        </div>
        {hasRounding && (
          <button
            className={`tile-round-toggle ${rounded ? 'is-active' : ''}`}
            onClick={() => setRounded(!rounded)}
          >
            Round
          </button>
        )}
      </div>
      {/* Always transparent: the checker backdrop just visualises transparency in
          the preview. Export is transparent PNG, so there is one single source of
          truth for the sticker's pixels. */}
      <div className="tile-stage tile-stage-checker">
        <div className="tile-stage-inner">
          {/* Single render: this is both the preview AND the html2canvas capture
              target. Capturing the live node guarantees the export matches the
              preview exactly — same fonts, same layout. The wrapper is a bare
              inline-block so capture grabs only the sticker's own pixels; the stage
              checker backdrop (`::before`) and `.tile-stage-inner` drop-shadow are on
              ancestors and stay out of the transparent PNG. */}
          <div ref={captureRef} style={{ display: 'inline-block' }}>
            <Comp run={run} visible={{ ...visible, rounded }} accent={accent} />
          </div>
        </div>
      </div>
      <div className="tile-actions">
        <button
          className={`tile-btn tile-btn-copy ${copyLabel ? 'is-done' : ''}`}
          onClick={handleCopy}
        >
          {copyLabel || 'Copy'}
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
