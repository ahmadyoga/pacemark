interface RouteLineProps {
  seed?: number
  stroke?: string
  strokeWidth?: number
  opacity?: number
  height?: number
}

export function RouteLine({
  seed = 1,
  stroke = 'currentColor',
  strokeWidth = 2,
  opacity = 1,
  height = 36,
}: RouteLineProps) {
  const points: string[] = []
  const N = 22
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1)
    const wob = Math.sin(t * 6 + seed) * 12 + Math.cos(t * 9 + seed * 1.3) * 5
    const x = 6 + t * 88
    const y = 50 + wob
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  const first = points[0].split(',')
  const last = points[points.length - 1].split(',')

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block', opacity }}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={first[0]} cy={first[1]} r="2.5" fill={stroke} />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={stroke} />
    </svg>
  )
}
