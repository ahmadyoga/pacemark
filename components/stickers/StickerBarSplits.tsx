import { type StickerProps } from './types'

export function StickerBarSplits({ run, visible, accent }: StickerProps) {
  const useRounded = !!visible.rounded
  const splits = useRounded ? run.splits.filter((s) => s.roundedKm > 0) : run.splits
  const maxSpeed = Math.max(...splits.map((s) => s.speed), 0.001)
  const minSpeed = Math.min(...splits.map((s) => s.speed), maxSpeed)
  const range = maxSpeed - minSpeed || 1

  if (splits.length === 0) {
    return (
      <div className="ovl ovl-barsplits">
        <div className="ovl-bs-empty">No split data</div>
      </div>
    )
  }

  return (
    <div className="ovl ovl-barsplits">
      {splits.map((s) => {
        const ratio = (s.speed - minSpeed) / range
        const width = 30 + ratio * 65
        const kmDisplay = !useRounded ? s.km : s.roundedKm

        return (
          <div key={s.km} className="ovl-bs-bar-wrap">
            <div
              className="ovl-bs-bar"
              style={{ width: `${width}%`, backgroundColor: accent }}
            >
              <span className="ovl-bs-km">{kmDisplay}</span>
              <span className="ovl-bs-pace">{s.pace}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
