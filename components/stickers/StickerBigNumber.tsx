'use client'
import type { StickerProps } from './types'
import { statList } from './types'

export function StickerBigNumber({ run, visible, accent }: StickerProps) {
  const stats = statList(run, visible).filter((s) => s[0] !== 'DIST')
  return (
    <div
      className="ovl ovl-bignum"
      style={{ ['--accent' as string]: accent, textAlign: 'center', width: 200 }}
    >
      <div className="ovl-bignum-lbl">DISTANCE</div>
      <div className="ovl-bignum-val">{run.distance}</div>
      <div className="ovl-bignum-unit">KILOMETERS</div>
      {stats.length > 0 && (
        <div className="ovl-bignum-foot">
          {stats.slice(0, 3).map((s, i) => (
            <span key={s[0]}>
              {i > 0 && <span className="ovl-bignum-sep">·</span>}
              <span className="ovl-bignum-foot-v">{s[1]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
