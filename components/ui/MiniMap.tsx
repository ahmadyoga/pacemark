import { RouteLine } from './RouteLine'

interface MiniMapProps {
  points: [number, number][]
  accent?: string
}

export function MiniMap({ points, accent = '#FF5A1F' }: MiniMapProps) {
  return (
    <div className="minimap">
      <div className="minimap-grid" />
      <div className="minimap-route">
        <RouteLine points={points} stroke={accent} strokeWidth={2.2} />
      </div>
    </div>
  )
}
