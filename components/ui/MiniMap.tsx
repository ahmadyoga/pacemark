import { RouteLine } from './RouteLine'

interface MiniMapProps {
  seed?: number
  accent?: string
}

export function MiniMap({ seed = 1, accent = '#FF5A1F' }: MiniMapProps) {
  return (
    <div
      style={{
        width: 84,
        height: 76,
        borderRadius: 10,
        background: '#0d0d10',
        border: '1px solid var(--line)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />
      <div style={{ position: 'absolute', inset: 8 }}>
        <RouteLine seed={seed} stroke={accent} strokeWidth={2.2} />
      </div>
    </div>
  )
}
