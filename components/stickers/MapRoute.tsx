interface MapRouteProps {
  /** Projected SVG-space points in viewBox 0..100 (from `DisplayActivity.routePoints`). */
  points: [number, number][]
  stroke: string
  strokeWidth?: number
}

/** Build a smooth path through points using mid-point quadratic beziers. */
function buildPath(pts: [number, number][]): string {
  const d: string[] = [`M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`]
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i][0] + pts[i + 1][0]) / 2).toFixed(2)
    const my = ((pts[i][1] + pts[i + 1][1]) / 2).toFixed(2)
    d.push(`Q ${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)} ${mx},${my}`)
  }
  const last = pts[pts.length - 1]
  d.push(`L ${last[0].toFixed(2)},${last[1].toFixed(2)}`)
  return d.join(' ')
}

export function MapRoute({ points, stroke, strokeWidth = 2.5 }: MapRouteProps) {
  // No-GPS activities (e.g. treadmill) → render nothing per design.
  if (!points || points.length < 2) return null

  // Render route lines noticeably thinner than the caller-requested width so the GPS shape reads
  // delicately instead of as a chunky neon outline. Single touchpoint keeps all callers consistent.
  const sw = strokeWidth * 0.55

  const d = buildPath(points)
  const [sx, sy] = points[0]
  const [ex, ey] = points[points.length - 1]

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Subtle glow behind the route — kept narrow so the line stays crisp */}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={sw * 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.16}
      />
      {/* Main route line */}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.95}
      />
      {/* Small start / end markers (no outer ring) */}
      <circle cx={sx} cy={sy} r={1.1} fill={stroke} opacity={0.95} />
      <circle cx={ex} cy={ey} r={1.1} fill={stroke} opacity={0.95} />
    </svg>
  )
}
