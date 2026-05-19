import { type StickerProps } from './types'

export function StickerHighlight({ run, visible, accent }: StickerProps) {
  // Build accent hex with transparency for the highlight mark
  const markBg = accent + '44' // 27% opacity

  return (
    <div className="ovl ovl-highlight">
      <p className="ovl-hl-line">
        {visible.distance && (
          <>
            ran{' '}
            <mark className="ovl-hl-mark" style={{ background: markBg, color: accent }}>
              {run.distance} km
            </mark>{' '}
          </>
        )}
        {visible.pace && (
          <>
            at{' '}
            <mark className="ovl-hl-mark" style={{ background: markBg, color: accent }}>
              {run.pace}
            </mark>
            /km{' '}
          </>
        )}
        {visible.duration && (
          <>
            in{' '}
            <mark className="ovl-hl-mark" style={{ background: markBg, color: accent }}>
              {run.duration}
            </mark>
            .{' '}
          </>
        )}
      </p>

      {(visible.heartRate || visible.elevation) && (
        <p className="ovl-hl-line ovl-hl-line-2">
          {visible.heartRate && run.heartRate !== '--' && (
            <>
              avg{' '}
              <mark className="ovl-hl-mark" style={{ background: markBg, color: accent }}>
                {run.heartRate} bpm
              </mark>
              {visible.elevation ? ',' : '.'}{' '}
            </>
          )}
          {visible.elevation && (
            <>
              <mark className="ovl-hl-mark" style={{ background: markBg, color: accent }}>
                +{run.elevation} m
              </mark>{' '}
              climbed.
            </>
          )}
        </p>
      )}

      <div className="ovl-hl-foot">
        <span className="ovl-hl-dot" style={{ background: accent }} />
        <span>{run.date}{visible.city ? ` · ${run.city}` : ''}</span>
      </div>
    </div>
  )
}
