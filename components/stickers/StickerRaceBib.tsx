import { type StickerProps } from './types'
import { accentFg } from './accentFg'

/**
 * Race-bib style card: rounded white body, accent header bar with brand + activity name,
 * hero distance with km unit, athlete name, divider, three-stat row, dark footer with
 * brand URL + date. Modelled on the crenoe.app reference layout.
 */
export function StickerRaceBib({ run, accent }: StickerProps) {
  const fg = accentFg(accent)
  const [distWhole, distFrac] = run.distance.split('.')
  const runner = (run.athleteName || run.title).toUpperCase()

  return (
    <div className="ovl ovl-bib">
      {/* Accent header bar — text colour follows accent contrast (dark on light accents) */}
      <div className="ovl-bib-head" style={{ background: accent, color: fg }}>
        <span className="ovl-bib-brand">PACEMARK</span>
        <span className="ovl-bib-event">{run.title.toUpperCase()}</span>
      </div>

      <div className="ovl-bib-body">
        <div className="ovl-bib-distance">
          <span className="ovl-bib-dist-v">
            {distWhole}
            {distFrac !== undefined && <span className="ovl-bib-dist-frac">.{distFrac}</span>}
          </span>
          <span className="ovl-bib-dist-u">KM</span>
        </div>

        <div className="ovl-bib-runner">{runner}</div>

        <div className="ovl-bib-rule" />

        <div className="ovl-bib-stats">
          <div className="ovl-bib-stat">
            <div className="ovl-bib-sv">{run.pace}</div>
            <div className="ovl-bib-sk">PACE</div>
          </div>
          <div className="ovl-bib-stat-sep" />
          <div className="ovl-bib-stat">
            <div className="ovl-bib-sv">{run.duration}</div>
            <div className="ovl-bib-sk">TIME</div>
          </div>
          <div className="ovl-bib-stat-sep" />
          <div className="ovl-bib-stat">
            <div className="ovl-bib-sv">{run.heartRate !== '--' ? run.heartRate : '–'}</div>
            <div className="ovl-bib-sk">HR</div>
          </div>
        </div>
      </div>

      {/* Dark footer bar: brand URL in accent, date right */}
      <div className="ovl-bib-foot">
        <span className="ovl-bib-foot-brand" style={{ color: accent }}>pacemark.app</span>
        <span className="ovl-bib-foot-date">{run.date}</span>
      </div>
    </div>
  )
}
