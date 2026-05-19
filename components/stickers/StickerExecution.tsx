import { type StickerProps } from './types'

export function StickerExecution({ run, accent }: StickerProps) {
  // Mock execution score if not available, usually 0-100
  const score = 92 
  
  return (
    <div className="ovl ovl-execution">
      <div className="ovl-exe-header">
        <div className="ovl-exe-lbl">EXECUTION SCORE</div>
        <div className="ovl-exe-val" style={{ color: accent }}>{score}</div>
      </div>
      <div className="ovl-exe-dial">
        <div className="ovl-exe-track" />
        <div 
          className="ovl-exe-progress" 
          style={{ 
            width: `${score}%`,
            background: `linear-gradient(90deg, transparent, ${accent})`
          }} 
        />
      </div>
      <div className="ovl-exe-stats">
        <div className="ovl-exe-stat">
          <span className="ovl-exe-sk">DIST</span>
          <span className="ovl-exe-sv">{run.distance} KM</span>
        </div>
        <div className="ovl-exe-stat">
          <span className="ovl-exe-sk">PACE</span>
          <span className="ovl-exe-sv">{run.pace}</span>
        </div>
      </div>
    </div>
  )
}
