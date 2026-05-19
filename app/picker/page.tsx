'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RunCard } from '@/components/ui/RunCard'
import type { DisplayActivity } from '@/lib/strava'

const ACCENT = '#FF5A1F'

export default function PickerPage() {
  const router = useRouter()
  const [runs, setRuns] = useState<DisplayActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/activities')
      .then((res) => {
        if (res.status === 401) {
          router.push('/')
          return null
        }
        if (!res.ok) throw new Error('fetch_failed')
        return res.json()
      })
      .then((data: DisplayActivity[] | null) => {
        if (data) {
          setRuns(data)
          if (data.length > 0) setSelectedId(data[0].id)
        }
      })
      .catch(() => setError('Could not load activities. Strava may be down.'))
      .finally(() => setLoading(false))
  }, [router])

  const selected = runs.find((r) => r.id === selectedId)

  function handleMakeStickers() {
    if (!selectedId) return
    router.push(`/studio/${selectedId}`)
  }

  return (
    <div className="screen screen-picker">
      <header className="picker-header">
        <div className="picker-user">
          <div className="picker-avatar">PM</div>
          <div className="picker-user-meta">
            <div className="picker-user-name">Pacemark Runner</div>
            <div className="picker-user-sub">Connected</div>
          </div>
        </div>
        <button
          className="picker-disconnect"
          onClick={async () => {
            await fetch('/api/auth/strava', { method: 'DELETE' }).catch(() => {})
            router.push('/')
          }}
        >
          Disconnect
        </button>
      </header>

      <div className="picker-title-row">
        <div className="picker-title-wrap">
          <div className="picker-eyebrow">RECENT ACTIVITIES</div>
          <h2 className="picker-title">Pick a run</h2>
        </div>
        <div className="picker-count">{runs.length} runs · last 30 days</div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
          Loading activities…
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--accent)' }}>
          {error}
        </div>
      )}

      <div className="picker-list">
        {runs.map((run) => (
          <RunCard
            key={run.id}
            run={run}
            active={selectedId === run.id}
            onClick={() => setSelectedId(run.id)}
            accent={ACCENT}
          />
        ))}
      </div>

      <div className="picker-cta-bar">
        <div className="picker-cta-meta">
          {selected
            ? <><b>{selected.title}</b> · {selected.distance} km</>
            : <>Tap a run above to continue</>}
        </div>
        <button
          className="picker-cta"
          disabled={!selectedId}
          onClick={handleMakeStickers}
        >
          Make Stickers →
        </button>
      </div>
    </div>
  )
}
