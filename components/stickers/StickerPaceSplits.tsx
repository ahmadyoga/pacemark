import { type StickerProps } from './types'

export function StickerPaceSplits({ run, accent }: StickerProps) {
  const splits = run.splits.slice(0, 8)
  const maxSpeed = Math.max(...splits.map((s) => s.speed), 0.001)

  if (splits.length === 0) {
    return (
      <div className="ovl ovl-pacesplits">
        <div className="ovl-ps-header">PACE SPLITS</div>
        <div className="ovl-ps-empty">No split data available</div>
      </div>
    )
  }

  return (
    <div className="ovl ovl-pacesplits">
      <div className="ovl-ps-header">PACE SPLITS</div>
      <div className="ovl-ps-rows">
        {splits.map((s) => (
          <div key={s.km} className="ovl-ps-row">
            <span className="ovl-ps-km">{s.km}</span>
            <div className="ovl-ps-bar-track">
              <div
                className="ovl-ps-bar-fill"
                style={{ width: `${(s.speed / maxSpeed) * 100}%`, backgroundColor: accent }}
              />
            </div>
            <span className="ovl-ps-pace">{s.pace}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
