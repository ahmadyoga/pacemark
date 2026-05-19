import { type StickerProps } from './types'

export function StickerBattery({ run, accent }: StickerProps) {
  // Battery usually shows duration or intensity
  return (
    <div className="ovl ovl-battery">
      <div className="ovl-bat-body">
        <div className="ovl-bat-content">
          <div className="ovl-bat-val">{run.distance}</div>
          <div className="ovl-bat-unit">KM</div>
        </div>
        <div className="ovl-bat-icon">
          <div className="ovl-bat-cap" />
          <div className="ovl-bat-level" style={{ width: '85%', backgroundColor: accent }} />
        </div>
      </div>
      <div className="ovl-bat-foot">
        <span>EST. ENERGY</span>
        <span style={{ color: accent }}>{run.calories} KCAL</span>
      </div>
    </div>
  )
}
