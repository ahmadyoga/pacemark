import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerCompleted({ run, visible, accent }: StickerProps) {
  const fg = accentFg(accent)

  // Standard targets to check against
  const distanceGoal = 5.0
  const isDistanceDone = parseFloat(run.distance) >= distanceGoal

  // Convert pace "M:SS" to seconds to compare
  const paceGoalSec = 360 // 6:00 /km
  const [minStr, secStr] = run.pace.split(':')
  const runPaceSec = parseInt(minStr || '0') * 60 + parseInt(secStr || '0')
  const isPaceDone = runPaceSec <= paceGoalSec && runPaceSec > 0

  return (
    <div className="ovl ovl-completed">
      <div className="ovl-comp-badge" style={{ backgroundColor: accent, color: fg }}>
        <span>ACTIVITY COMPLETED</span>
      </div>

      <div className="ovl-comp-list">
        {visible.distance && (
          <div className="ovl-comp-item">
            <span className={`ovl-comp-box ${isDistanceDone ? 'is-checked' : ''}`} style={isDistanceDone ? { borderColor: accent, color: accent } : {}}>
              {isDistanceDone ? '✓' : ''}
            </span>
            <div className="ovl-comp-details">
              <span className="ovl-comp-label">DISTANCE TARGET (5K+)</span>
              <span className="ovl-comp-value">{run.distance} km</span>
            </div>
          </div>
        )}

        {visible.pace && (
          <div className="ovl-comp-item">
            <span className={`ovl-comp-box ${isPaceDone ? 'is-checked' : ''}`} style={isPaceDone ? { borderColor: accent, color: accent } : {}}>
              {isPaceDone ? '✓' : ''}
            </span>
            <div className="ovl-comp-details">
              <span className="ovl-comp-label">PACE TARGET (&lt;6:00/KM)</span>
              <span className="ovl-comp-value">{run.pace} /km</span>
            </div>
          </div>
        )}

        {visible.duration && (
          <div className="ovl-comp-item">
            <span className="ovl-comp-box is-checked" style={{ borderColor: accent, color: accent }}>✓</span>
            <div className="ovl-comp-details">
              <span className="ovl-comp-label">WORKOUT EFFORT</span>
              <span className="ovl-comp-value">{run.duration}</span>
            </div>
          </div>
        )}
      </div>

      <div className="ovl-comp-foot">
        <span className="ovl-comp-date">{run.date.toUpperCase()}</span>
        {visible.city && <span className="ovl-comp-city"> · {run.city.toUpperCase()}</span>}
      </div>
    </div>
  )
}
