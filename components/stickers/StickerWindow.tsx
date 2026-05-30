import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerWindow({ run, visible, accent }: StickerProps) {
  const fg = accentFg(accent)

  return (
    <div className="ovl ovl-window">
      <div className="ovl-win-titlebar" style={{ borderBottomColor: `${accent}44` }}>
        <div className="ovl-win-dots">
          <span className="ovl-win-dot" style={{ backgroundColor: accent }} />
          <span className="ovl-win-dot" style={{ backgroundColor: accent, opacity: 0.5 }} />
          <span className="ovl-win-dot" style={{ backgroundColor: accent, opacity: 0.25 }} />
        </div>
        <div className="ovl-win-title">RUN_SESSION.SH</div>
        <div className="ovl-win-spacer" />
      </div>

      <div className="ovl-win-body">
        <div className="ovl-win-line">
          <span className="ovl-win-prompt" style={{ color: accent }}>$</span>
          <span className="ovl-win-cmd">cat metrics.json</span>
        </div>

        <div className="ovl-win-outputs">
          {visible.distance && (
            <div className="ovl-win-out-row">
              <span className="ovl-win-key">"distance":</span>
              <span className="ovl-win-val" style={{ color: accent }}>"{run.distance} km"</span>
            </div>
          )}
          {visible.pace && (
            <div className="ovl-win-out-row">
              <span className="ovl-win-key">"avg_pace":</span>
              <span className="ovl-win-val" style={{ color: accent }}>"{run.pace}/km"</span>
            </div>
          )}
          {visible.duration && (
            <div className="ovl-win-out-row">
              <span className="ovl-win-key">"duration":</span>
              <span className="ovl-win-val" style={{ color: accent }}>"{run.duration}"</span>
            </div>
          )}
          {visible.elevation && (
            <div className="ovl-win-out-row">
              <span className="ovl-win-key">"elevation":</span>
              <span className="ovl-win-val" style={{ color: accent }}>"+{run.elevation}m"</span>
            </div>
          )}
          {visible.city && (
            <div className="ovl-win-out-row">
              <span className="ovl-win-key">"location":</span>
              <span className="ovl-win-val" style={{ color: accent }}>"{run.city}"</span>
            </div>
          )}
        </div>

        <div className="ovl-win-line ovl-win-blink-wrap">
          <span className="ovl-win-prompt" style={{ color: accent }}>$</span>
          <span className="ovl-win-cursor" style={{ backgroundColor: accent }} />
        </div>
      </div>
    </div>
  )
}
