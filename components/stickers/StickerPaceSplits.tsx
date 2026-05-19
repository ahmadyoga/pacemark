import { type StickerProps } from './types'

export function StickerPaceSplits({ run, visible, accent }: StickerProps) {
  const useRounded = !!visible.rounded
  const splits = useRounded ? run.splits.filter((s) => s.roundedKm > 0) : run.splits
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
        {splits.map((s) => {
          const kmDisplay = useRounded ? s.roundedKm : s.km
          return (
            <div key={s.km} className="ovl-ps-row">
              <span className="ovl-ps-km">{kmDisplay}</span>
              <div className="ovl-ps-bar-track">
                <div
                  className="ovl-ps-bar-fill"
                  style={{ width: `${(s.speed / maxSpeed) * 100}%`, backgroundColor: accent }}
                />
              </div>
              <span className="ovl-ps-pace">{s.pace}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
