import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerStaggeredStrips({ run, accent }: StickerProps) {
  const fg = accentFg(accent)
  const strips = [
    { label: 'DISTANCE', value: run.distance, unit: 'KM',  widthPct: 68, align: 'flex-start' },
    { label: 'TIME',     value: run.duration,  unit: '',    widthPct: 84, align: 'flex-end'   },
    { label: 'PACE',     value: run.pace,      unit: '/KM', widthPct: 64, align: 'flex-start' },
  ]

  return (
    <div className="ovl ovl-strips">
      {strips.map((s) => (
        <div
          key={s.label}
          className="ovl-strip-row"
          style={{
            display: 'flex',
            justifyContent: s.align,
          }}
        >
          <div
            className="ovl-strip"
            style={{
              backgroundColor: accent,
              color: fg,
              width: `${s.widthPct}%`,
            }}
          >
            <span className="ovl-strip-lbl">{s.label}</span>
            <span className="ovl-strip-rhs">
              <span className="ovl-strip-val">{s.value}</span>
              {s.unit && <span className="ovl-strip-unit">{s.unit}</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
