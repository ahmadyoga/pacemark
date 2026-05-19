import { type StickerProps } from './types'
import { accentFg } from './accentFg'

export function StickerHighlight({ run, visible, accent }: StickerProps) {
  const fg = accentFg(accent)
  // Build accent hex with transparency for the highlight mark
  const markBg = accent + '44' // 27% opacity
  // Use the full accent color for text (readable on the semi-transparent mark)
  // but fall back to a darker shade when accent is white so text contrasts
  const markColor = fg === '#000' ? 'rgba(0,0,0,0.75)' : accent

  return (
    <div className="ovl ovl-highlight">
      <p className="ovl-hl-line">
        {visible.distance && (
          <>
            ran{' '}
            <mark className="ovl-hl-mark" style={{ background: markBg, color: markColor }}>
              {run.distance} km
            </mark>{' '}
          </>
        )}
        {visible.pace && (
          <>
            at{' '}
            <mark className="ovl-hl-mark" style={{ background: markBg, color: markColor }}>
              {run.pace}
            </mark>
            /km{' '}
          </>
        )}
        {visible.duration && (
          <>
            in{' '}
            <mark className="ovl-hl-mark" style={{ background: markBg, color: markColor }}>
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
              <mark className="ovl-hl-mark" style={{ background: markBg, color: markColor }}>
                {run.heartRate} bpm
              </mark>
              {visible.elevation ? ',' : '.'}{' '}
            </>
          )}
          {visible.elevation && (
            <>
              <mark className="ovl-hl-mark" style={{ background: markBg, color: markColor }}>
                +{run.elevation} m
              </mark>{' '}
              climbed.
            </>
          )}
        </p>
      )}

      <div className="ovl-hl-foot">
        <span className="ovl-hl-dot" style={{ background: accent, ...(fg === '#000' ? { boxShadow: '0 0 0 1px rgba(0,0,0,0.2)' } : {}) }} />
        <span>{run.date}{visible.city ? ` · ${run.city}` : ''}</span>
      </div>
    </div>
  )
}
