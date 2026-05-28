import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerHeartbeat({ run, visible, accent }: StickerProps) {
  const fg = accentFg(accent)
  const hasHr = run.heartRate !== '--'

  // Generate a distinct ECG heartbeat wave path
  const svgPath = hasHr
    ? "M 0 16 L 25 16 L 33 5 L 39 28 L 45 0 L 51 22 L 56 16 L 80 16 L 90 16 L 98 6 L 104 27 L 110 1 L 116 21 L 121 16 L 150 16 L 160 16 L 168 4 L 174 29 L 180 0 L 186 23 L 191 16 L 220 16"
    : "M 0 16 L 220 16" // flatline if no heart rate data

  return (
    <div className="ovl ovl-heartbeat">
      <div className="ovl-hb-header">
        <span className="ovl-hb-title">HEARTBEAT SUMMARY</span>
        <span className="ovl-hb-status" style={{ color: hasHr ? accent : 'rgba(255,255,255,0.3)' }}>
          {hasHr ? '● ACTIVE MONITORING' : '▲ FLATLINE / OFFLINE'}
        </span>
      </div>

      <div className="ovl-hb-body">
        {visible.heartRate && (
          <div className="ovl-hb-rate">
            <span className="ovl-hb-num">{run.heartRate}</span>
            <span className="ovl-hb-unit" style={{ color: accent }}>BPM</span>
          </div>
        )}

        <div className="ovl-hb-wave">
          <svg viewBox="0 0 220 32" preserveAspectRatio="none" style={{ width: '100%', height: 32 }}>
            {/* Glowing background path */}
            <path
              d={svgPath}
              fill="none"
              stroke={accent}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.35, filter: 'blur(2px)' }}
            />
            {/* Crisp foreground path */}
            <path
              d={svgPath}
              fill="none"
              stroke={accent}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="ovl-hb-foot">
        <span>AVG INTENSITY</span>
        <span className="ovl-hb-accent-dot" style={{ backgroundColor: accent }} />
        <span>{run.date.toUpperCase()}</span>
      </div>
    </div>
  )
}
