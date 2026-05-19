'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { StickerTile } from '@/components/ui/StickerTile'
import { STICKER_DEFS, VISIBLE_LABELS, type VisibleMetrics } from '@/components/stickers'
import type { DisplayActivity } from '@/lib/strava'

const ACCENT_SWATCHES = ['#FF5A1F', '#22D3A0', '#9B5CFF', '#FFC83D', '#3B82F6', '#F472B6']

function CheckIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 4 7 12l8 8" />
    </svg>
  )
}

const DEFAULT_VISIBLE: VisibleMetrics = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

export default function StudioPage() {
  const router = useRouter()
  const params = useParams()
  const runId = params.runId as string

  const [run, setRun] = useState<DisplayActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState<VisibleMetrics>(DEFAULT_VISIBLE)
  const [accent, setAccent] = useState(ACCENT_SWATCHES[0])
  const [bg, setBg] = useState<'dark' | 'light' | 'checker'>('dark')

  useEffect(() => {
    if (!runId) return
    fetch(`/api/activities/${runId}`)
      .then((res) => {
        if (res.status === 401) { router.push('/'); return null }
        if (!res.ok) throw new Error('fetch_failed')
        return res.json()
      })
      .then((data: DisplayActivity | null) => { if (data) setRun(data) })
      .catch(() => router.push('/picker'))
      .finally(() => setLoading(false))
  }, [runId, router])

  function toggleMetric(k: keyof VisibleMetrics) {
    setVisible((v) => ({ ...v, [k]: !v[k] }))
  }

  if (loading || !run) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
        Loading…
      </div>
    )
  }

  return (
    <div className="screen screen-studio">
      <header className="studio-head">
        <button className="studio-back" onClick={() => router.push('/picker')}>
          <ArrowLeftIcon /> Activities
        </button>
        <div className="studio-runref">
          <div className="studio-runref-date">{run.date.toUpperCase()}</div>
          <div className="studio-runref-title">{run.title}</div>
          <div className="studio-runref-stats">
            <span><b>{run.distance}</b> km</span>
            <span className="studio-runref-dot">·</span>
            <span><b>{run.pace}</b>/km</span>
            <span className="studio-runref-dot">·</span>
            <span><b>{run.duration}</b></span>
          </div>
        </div>
      </header>

      <div className="studio-toolbar">
        <div className="toolbar-sec">
          <div className="toolbar-eyebrow">METRICS TO SHOW</div>
          <div className="chip-row">
            {(Object.keys(VISIBLE_LABELS) as (keyof VisibleMetrics)[]).map((k) => (
              <button
                key={k}
                className={`chip ${visible[k] ? 'is-on' : ''}`}
                onClick={() => toggleMetric(k)}
              >
                <span className="chip-dot" />
                {VISIBLE_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-sec toolbar-sec-row">
          <div className="toolbar-sub">
            <div className="toolbar-eyebrow">ACCENT</div>
            <div className="swatch-row">
              {ACCENT_SWATCHES.map((c) => (
                <button
                  key={c}
                  className={`swatch ${accent === c ? 'is-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setAccent(c)}
                  aria-label={c}
                >
                  {accent === c && <CheckIcon />}
                </button>
              ))}
            </div>
          </div>
          <div className="toolbar-sub">
            <div className="toolbar-eyebrow">PREVIEW ON</div>
            <div className="bg-row">
              {(['dark', 'light', 'checker'] as const).map((id) => (
                <button
                  key={id}
                  className={`bg-btn ${bg === id ? 'is-active' : ''}`}
                  onClick={() => setBg(id)}
                >
                  <span className={`bg-swatch bg-swatch-${id}`} />
                  {id === 'dark' ? 'Dark photo' : id === 'light' ? 'Light photo' : 'Transparent'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="studio-grid">
        {STICKER_DEFS.map((def) => (
          <StickerTile
            key={def.id}
            def={def}
            run={run}
            visible={visible}
            accent={accent}
            bg={bg}
          />
        ))}
      </div>

      <footer className="studio-foot">
        Drop the PNG into Instagram Story · or long-press to paste from clipboard
      </footer>
    </div>
  )
}
