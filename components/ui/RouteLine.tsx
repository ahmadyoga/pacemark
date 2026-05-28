interface RouteLineProps {
  /** Projected SVG-space points in viewBox 0..100 (from `DisplayActivity.routePoints`). */
  points: [number, number][]
  stroke?: string
  strokeWidth?: number
  opacity?: number
}

/** Renders the activity's real GPS trace for the run-card thumbnail. Hidden when no GPS. */
export function RouteLine({
  points,
  stroke = 'currentColor',
  strokeWidth = 2,
  opacity = 1,
}: RouteLineProps) {
  if (!points || points.length < 2) return null

  const poly = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [sx, sy] = points[0]
  const [ex, ey] = points[points.length - 1]

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%', display: 'block', opacity }}
    >
      <polyline
        points={poly}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={sx} cy={sy} r="2.5" fill={stroke} />
      <circle cx={ex} cy={ey} r="2.5" fill={stroke} />
    </svg>
  )
}
