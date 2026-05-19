import { type StickerProps } from './types'

export function StickerStaggeredStrips({ run, accent }: StickerProps) {
  const strips = [
    { label: 'DISTANCE', value: run.distance, unit: 'KM',  widthPct: 68 },
    { label: 'TIME',     value: run.duration,  unit: '',    widthPct: 84 },
    { label: 'PACE',     value: run.pace,      unit: '/KM', widthPct: 100 },
  ]

  return (
    <div className="ovl ovl-strips">
      {strips.map((s) => (
        <div key={s.label} className="ovl-strip-row">
          <div
            className="ovl-strip"
            style={{ width: `${s.widthPct}%`, backgroundColor: accent }}
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
