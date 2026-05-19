import { type StickerProps } from './types'

export function StickerTerminal({ run, accent }: StickerProps) {
  const rows: [string, string][] = [
    ['dist:', `${run.distance} km`],
    ['pace:', `${run.pace} /km`],
    ['hr:',   `${run.heartRate} bpm`],
    ['time:', run.duration],
  ]

  return (
    <div className="ovl-terminal" style={{ borderLeftColor: accent }}>
      <div className="ovl-term-cmd">
        <span className="ovl-term-prompt" style={{ color: accent }}>$</span>
        {' run_stats --latest'}
      </div>
      <div className="ovl-term-rows">
        {rows.map(([k, v]) => (
          <div key={k} className="ovl-term-row">
            <span className="ovl-term-k">{k}</span>
            <span className="ovl-term-v">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
