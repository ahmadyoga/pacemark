import { RouteLine } from './RouteLine'

interface MiniMapProps {
  seed?: number
  accent?: string
}

export function MiniMap({ seed = 1, accent = '#FF5A1F' }: MiniMapProps) {
  return (
    <div className="minimap">
      <div className="minimap-grid" />
      <div className="minimap-route">
        <RouteLine seed={seed} stroke={accent} strokeWidth={2.2} />
      </div>
    </div>
  )
}

