import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerVerified({ run, visible, accent }: StickerProps) {
  const fg = accentFg(accent)

  return (
    <div className="ovl ovl-verified">
      <div className="ovl-vf-badge-wrap">
        <div className="ovl-vf-badge" style={{ borderColor: accent, boxShadow: `0 0 16px ${accent}22` }}>
          <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ovl-vf-check">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 11 2 2 4-4" />
          </svg>
        </div>
      </div>

      <div className="ovl-vf-content">
        <div className="ovl-vf-status">PACEMARK VERIFIED</div>
        <div className="ovl-vf-subtitle">OFFICIAL STRAVA RECORD</div>

        <div className="ovl-vf-stats">
          {visible.distance && (
            <div className="ovl-vf-stat">
              <span className="ovl-vf-label">DIST</span>
              <span className="ovl-vf-val">{run.distance}K</span>
            </div>
          )}
          {visible.pace && (
            <div className="ovl-vf-stat">
              <span className="ovl-vf-label">PACE</span>
              <span className="ovl-vf-val">{run.pace}</span>
            </div>
          )}
          {visible.duration && (
            <div className="ovl-vf-stat">
              <span className="ovl-vf-label">TIME</span>
              <span className="ovl-vf-val">{run.duration}</span>
            </div>
          )}
        </div>
      </div>

      <div className="ovl-vf-foot" style={{ backgroundColor: accent, color: fg }}>
        <span>ID: {run.id.toString().slice(-6)} · {run.date.toUpperCase()}</span>
      </div>
    </div>
  )
}
