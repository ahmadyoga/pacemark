import { type StickerProps } from './types'

export function StickerGlowSplits({ run, visible, accent }: StickerProps) {
  const useRounded = !!visible.rounded
  const splits = (useRounded ? run.splits.filter((s) => s.roundedKm > 0) : run.splits).slice(0, 8)
  const maxSpeed = Math.max(...splits.map((s) => s.speed), 0.001)
  const minSpeed = Math.min(...splits.map((s) => s.speed), maxSpeed)
  const range = maxSpeed - minSpeed || 1

  if (splits.length === 0) {
    return (
      <div className="ovl ovl-glowsplits">
        <div className="ovl-gs-empty">No split data</div>
      </div>
    )
  }

  return (
    <div className="ovl ovl-glowsplits">
      {splits.map((s) => {
        const ratio = (s.speed - minSpeed) / range
        const opacity = 0.18 + ratio * 0.82
        const width = 28 + ratio * 62
        const glow = ratio > 0.65 ? `0 0 ${ratio * 14}px ${accent}88` : 'none'
        const kmDisplay = useRounded ? s.roundedKm : s.km

        return (
          <div key={s.km} className="ovl-gs-row">
            <span className="ovl-gs-km">{kmDisplay}</span>
            <div className="ovl-gs-bar-wrap">
              <div
                className="ovl-gs-bar"
                style={{
                  width: `${width}%`,
                  backgroundColor: accent,
                  opacity,
                  boxShadow: glow,
                }}
              />
            </div>
            <span className="ovl-gs-pace">{s.pace}</span>
          </div>
        )
      })}
    </div>
  )
}
