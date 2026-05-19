import { type StickerProps } from './types'

export function StickerRaceBib({ run, visible, accent }: StickerProps) {
  // Use last 4 digits of run id so it always fits the bib layout
  const bib = String(run.id % 10000).padStart(4, '0')

  return (
    <div className="ovl ovl-bib">
      {/* Top color bar */}
      <div className="ovl-bib-bar" style={{ background: accent }} />

      <div className="ovl-bib-body">
        {/* Header row */}
        <div className="ovl-bib-header">
          <div className="ovl-bib-event">OFFICIAL RUN RECORD</div>
          <div className="ovl-bib-label">pacemark</div>
        </div>

        {/* Big bib number */}
        <div className="ovl-bib-number" style={{ color: accent }}>
          {bib}
        </div>

        {/* Name + city */}
        <div className="ovl-bib-runner">
          {visible.city ? run.city.toUpperCase() : run.title.toUpperCase()}
        </div>

        {/* Divider */}
        <div className="ovl-bib-rule" />

        {/* Stats row */}
        <div className="ovl-bib-stats">
          {visible.distance && (
            <div className="ovl-bib-stat">
              <div className="ovl-bib-sv">{run.distance}</div>
              <div className="ovl-bib-sk">KM</div>
            </div>
          )}
          {visible.pace && (
            <div className="ovl-bib-stat">
              <div className="ovl-bib-sv">{run.pace}</div>
              <div className="ovl-bib-sk">/KM</div>
            </div>
          )}
          {visible.duration && (
            <div className="ovl-bib-stat">
              <div className="ovl-bib-sv">{run.duration}</div>
              <div className="ovl-bib-sk">TIME</div>
            </div>
          )}
          {visible.heartRate && run.heartRate !== '--' && (
            <div className="ovl-bib-stat">
              <div className="ovl-bib-sv">{run.heartRate}</div>
              <div className="ovl-bib-sk">BPM</div>
            </div>
          )}
        </div>

        {/* Date bottom */}
        <div className="ovl-bib-date">{run.date.toUpperCase()}</div>
      </div>

      {/* Bottom bar */}
      <div className="ovl-bib-bar" style={{ background: accent }} />
    </div>
  )
}
