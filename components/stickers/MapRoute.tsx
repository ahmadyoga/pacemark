interface MapRouteProps {
  seed: number
  stroke: string
  strokeWidth?: number
}

function buildPoints(seed: number): string {
  const raw: [number, number][] = []
  let x = 0, y = 0
  let angle = seed * 2.4
  for (let i = 0; i < 30; i++) {
    angle += Math.sin(i * seed * 0.7 + i * 0.31) * 0.65
    x += Math.cos(angle) * 7
    y += Math.sin(angle) * 7
    raw.push([x, y])
  }
  const xs = raw.map((p) => p[0])
  const ys = raw.map((p) => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const scale = Math.min(80 / (maxX - minX || 1), 80 / (maxY - minY || 1))
  return raw
    .map(([px, py]) => `${(10 + (px - minX) * scale).toFixed(1)},${(10 + (py - minY) * scale).toFixed(1)}`)
    .join(' ')
}

export function MapRoute({ seed, stroke, strokeWidth = 2.5 }: MapRouteProps) {
  const points = buildPoints(seed)
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
    </svg>
  )
}
