import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerSwissGrid({ run, visible, accent }: StickerProps) {
  const fg = accentFg(accent)

  return (
    <div className="ovl ovl-swissgrid">
      <div className="ovl-sg-top">
        <span className="ovl-sg-brand" style={{ color: accent }}>SWISS LABS // VOL. 04</span>
        {visible.distance && (
          <div className="ovl-sg-hero">
            <span className="ovl-sg-hero-num">{run.distance}</span>
            <span className="ovl-sg-hero-unit">KM</span>
          </div>
        )}
      </div>

      <div className="ovl-sg-divider" style={{ backgroundColor: accent }} />

      <div className="ovl-sg-main">
        <div className="ovl-sg-col">
          {visible.pace && (
            <div className="ovl-sg-metric">
              <span className="ovl-sg-label">AVERAGE PACE</span>
              <span className="ovl-sg-val">{run.pace}/km</span>
            </div>
          )}
          {visible.duration && (
            <div className="ovl-sg-metric">
              <span className="ovl-sg-label">ELAPSED TIME</span>
              <span className="ovl-sg-val">{run.duration}</span>
            </div>
          )}
        </div>

        <div className="ovl-sg-col">
          {visible.elevation && (
            <div className="ovl-sg-metric">
              <span className="ovl-sg-label">ELEVATION GAIN</span>
              <span className="ovl-sg-val">+{run.elevation}m</span>
            </div>
          )}
          <div className="ovl-sg-metric">
            <span className="ovl-sg-label">RECORDED ON</span>
            <span className="ovl-sg-val">{run.date}</span>
          </div>
        </div>
      </div>

      {visible.city && (
        <div className="ovl-sg-foot" style={{ borderColor: `${accent}33` }}>
          <span>LOCATED // {run.city.toUpperCase()}</span>
        </div>
      )}
    </div>
  )
}
