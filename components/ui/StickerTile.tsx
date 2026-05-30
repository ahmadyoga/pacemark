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
  bg: 'dark' | 'light' | 'checker'
}

export function StickerTile({ def, run, visible, accent, bg }: StickerTileProps) {
  const captureRef = useRef<HTMLDivElement>(null)
  const [copyLabel, setCopyLabel] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'working' | 'done'>('idle')
  const [rounded, setRounded] = useState(false)
  const [zoom, setZoom] = useState(1)

  const Comp = def.comp
  const hasRounding = def.id === 'glowsplits' || def.id === 'pacesplits'
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
        <div className="tile-head-controls">
          {hasRounding && (
            <button
              className={`tile-round-toggle ${rounded ? 'is-active' : ''}`}
              onClick={() => setRounded(!rounded)}
            >
              Round
            </button>
          )}
          <div className="tile-zoom">
            <button
              className="tile-zoom-btn"
              onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              disabled={zoom <= 0.5}
              aria-label="Zoom out"
            >−</button>
            <span className="tile-zoom-label">{Math.round(zoom * 100)}%</span>
            <button
              className="tile-zoom-btn"
              onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
              disabled={zoom >= 3}
              aria-label="Zoom in"
            >+</button>
          </div>
        </div>
      </div>
      <div className={`tile-stage tile-stage-${bg}`}>
        <div
          className="tile-stage-inner"
          style={zoom !== 1 ? { transform: `scale(${zoom})` } : undefined}
        >
          <Comp run={run} visible={{ ...visible, rounded }} accent={accent} />
        </div>
      </div>
      {/* Off-screen export target — mirrors tile-stage so PNG includes background + padding.
          Uses inline-flex so it shrinks to content width rather than stretching to container. */}
      <div
        style={{ position: 'fixed', left: -9999, top: -9999, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <div
          ref={captureRef}
          className={`tile-stage tile-stage-${bg}`}
          style={{ border: 'none', aspectRatio: 'unset', display: 'inline-flex', position: 'relative' }}
        >
          <div className="tile-stage-inner">
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
