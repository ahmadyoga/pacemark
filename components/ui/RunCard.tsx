'use client'
import { MiniMap } from './MiniMap'
import type { DisplayActivity } from '@/lib/strava'

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
  )
}

function PinIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

interface RunCardProps {
  run: DisplayActivity
  active: boolean
  onClick: () => void
  accent: string
}

export function RunCard({ run, active, onClick, accent }: RunCardProps) {
  return (
    <button
      className={`runcard ${active ? 'is-active' : ''}`}
      onClick={onClick}
    >
      <MiniMap points={run.routePoints} accent={active ? accent : '#71717a'} />
      <div className="runcard-body">
        <div className="runcard-top">
          <div className="runcard-title">
            {run.title}
            {run.fresh && <span className="runcard-fresh">NEW</span>}
          </div>
          <div className="runcard-date">{run.date}</div>
        </div>
        <div className="runcard-stats">
          <div className="runcard-stat">
            <div className="runcard-stat-v">{run.distance}<span>km</span></div>
            <div className="runcard-stat-k">distance</div>
          </div>
          <div className="runcard-stat">
            <div className="runcard-stat-v">{run.pace}<span>/km</span></div>
            <div className="runcard-stat-k">pace</div>
          </div>
          <div className="runcard-stat">
            <div className="runcard-stat-v">{run.duration}</div>
            <div className="runcard-stat-k">duration</div>
          </div>
        </div>
        <div className="runcard-foot">
          <span className="runcard-pin"><PinIcon /> {run.city}</span>
          <span>♥ {run.heartRate} bpm</span>
          <span>↑ {run.elevation} m</span>
        </div>
      </div>
      <div className={`runcard-check ${active ? 'is-active' : ''}`}>
        {active && <CheckIcon />}
      </div>
    </button>
  )
}
