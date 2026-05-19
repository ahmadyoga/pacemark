import { type StickerProps } from './types'

function Barcode({ seed }: { seed: number }) {
  const rects: { x: number; w: number }[] = []
  let x = 0
  const s = seed * 997
  for (let i = 0; i < 40; i++) {
    const w = ((s * (i + 1) * 0.137) % 2) + 0.8
    if (i % 2 === 0) rects.push({ x: Math.round(x * 10) / 10, w: Math.max(0.8, w) })
    x += w + ((s * (i + 1) * 0.073) % 1.5) + 0.5
  }
  const totalW = Math.ceil(x)
  return (
    <svg
      viewBox={`0 0 ${totalW} 24`}
      preserveAspectRatio="none"
      style={{ width: 120, height: 24, display: 'block' }}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.w} height={24} fill="#1a1a1a" />
      ))}
    </svg>
  )
}

export function StickerThermalReceipt({ run }: StickerProps) {
  const score = Math.min(100, Math.round(parseFloat(run.distance) * 10))

  const rows: [string, string][] = [
    ['DATE', run.date.toUpperCase()],
    ['DISTANCE', `${run.distance} KM`],
    ['AVG PACE', `${run.pace} /KM`],
    ['DURATION', run.duration],
    ['AVG HR', run.heartRate !== '--' ? `${run.heartRate} BPM` : '-- BPM'],
    ['ELEVATION', `+${run.elevation} M`],
    ['CALORIES', run.calories !== '--' ? `${run.calories} CAL` : '-- CAL'],
  ]

  return (
    <div className="ovl-receipt">
      <div className="ovl-rcpt-header">
        <div className="ovl-rcpt-brand">PACEMARK</div>
        <div className="ovl-rcpt-sub">RUN RECEIPT · OFFICIAL RECORD</div>
      </div>
      <div className="ovl-rcpt-divider" />
      <div className="ovl-rcpt-title">{run.title}</div>
      <div className="ovl-rcpt-divider" />
      <div className="ovl-rcpt-rows">
        {rows.map(([k, v]) => (
          <div key={k} className="ovl-rcpt-row">
            <span className="ovl-rcpt-key">{k}</span>
            <span className="ovl-rcpt-val">{v}</span>
          </div>
        ))}
      </div>
      <div className="ovl-rcpt-divider" />
      <div className="ovl-rcpt-score-row">
        <span className="ovl-rcpt-key">EXECUTION SCORE</span>
        <span className="ovl-rcpt-score">{score} / 100</span>
      </div>
      <div className="ovl-rcpt-divider" />
      <div className="ovl-rcpt-barcode-wrap">
        <Barcode seed={run.routeSeed} />
      </div>
      <div className="ovl-rcpt-foot">THANK YOU FOR YOUR RUN</div>
    </div>
  )
}
