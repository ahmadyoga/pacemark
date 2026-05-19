import { type StickerProps } from './types'

export function StickerEquation({ run, accent }: StickerProps) {
  return (
    <div className="ovl ovl-equation">
      {/* Eyebrow */}
      <div className="ovl-eq-eyebrow">RUN EQUATION</div>

      {/* Main equation row */}
      <div className="ovl-eq-row">
        <div className="ovl-eq-block">
          <div className="ovl-eq-val">{run.duration}</div>
          <div className="ovl-eq-key">TIME</div>
        </div>

        <div className="ovl-eq-op">÷</div>

        <div className="ovl-eq-block">
          <div className="ovl-eq-val">{run.distance}</div>
          <div className="ovl-eq-key">KM</div>
        </div>

        <div className="ovl-eq-op ovl-eq-op-eq">=</div>

        <div className="ovl-eq-block ovl-eq-result">
          <div className="ovl-eq-val ovl-eq-result-val" style={{ color: accent }}>
            {run.pace}
          </div>
          <div className="ovl-eq-key">/KM PACE</div>
        </div>
      </div>

      {/* Sub stats */}
      <div className="ovl-eq-foot">
        {run.heartRate !== '--' && (
          <span className="ovl-eq-chip">♥ {run.heartRate} bpm</span>
        )}
        <span className="ovl-eq-chip">↑ {run.elevation} m elev</span>
        <span className="ovl-eq-chip">{run.date}</span>
      </div>
    </div>
  )
}
