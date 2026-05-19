import { type StickerProps } from './types'

export function StickerGhostStats({ run }: StickerProps) {
  const cols = [
    { label: 'Dist', value: `${run.distance} km` },
    { label: 'Pace', value: `${run.pace}/km` },
    { label: 'Time', value: run.duration },
  ]

  return (
    <div className="ovl ovl-ghost">
      {cols.map((c) => (
        <div key={c.label} className="ovl-ghost-col">
          <div className="ovl-ghost-lbl">{c.label}</div>
          <div className="ovl-ghost-val">{c.value}</div>
        </div>
      ))}
    </div>
  )
}
