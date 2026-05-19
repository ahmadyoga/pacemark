interface MapRouteProps {
  seed: number
  stroke: string
  strokeWidth?: number
}

/** Seeded pseudo-random in [0,1) — each (seed, idx) pair gives a distinct value */
function sr(seed: number, idx: number): number {
  const s = Math.sin(seed * 91.233 + idx * 577.13) * 43758.5453
  return s - Math.floor(s)
}

function buildPath(seed: number): string {
  const N = 30
  const pts: [number, number][] = [[0, 0]]
  let x = 0, y = 0
  // Start heading in a direction derived from seed so each route looks different
  let angle = sr(seed, 99) * Math.PI * 2

  for (let i = 0; i < N; i++) {
    const r = sr(seed, i)
    // ~12% chance of a sharp corner (like turning at a street); rest is gentle drift
    const turn = r < 0.12
      ? (sr(seed, i + 50) > 0.5 ? 1.35 : -1.35)
      : (sr(seed, i + 100) - 0.5) * 0.6
    angle += turn
    const step = 4 + sr(seed, i + 200) * 10
    x += Math.cos(angle) * step
    y += Math.sin(angle) * step
    pts.push([x, y])
  }

  // Normalize: fit into [10, 90] × [10, 90] inside a 100×100 viewBox
  const xs = pts.map(p => p[0])
  const ys = pts.map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const scale = Math.min(80 / (maxX - minX || 1), 80 / (maxY - minY || 1))
  const ox = 10 + (80 - (maxX - minX) * scale) / 2
  const oy = 10 + (80 - (maxY - minY) * scale) / 2

  const norm = pts.map(([px, py]): [number, number] => [
    ox + (px - minX) * scale,
    oy + (py - minY) * scale,
  ])

  // Build a smooth path using mid-point quadratic beziers
  const d: string[] = [`M ${norm[0][0].toFixed(1)},${norm[0][1].toFixed(1)}`]
  for (let i = 1; i < norm.length - 1; i++) {
    const mx = ((norm[i][0] + norm[i + 1][0]) / 2).toFixed(1)
    const my = ((norm[i][1] + norm[i + 1][1]) / 2).toFixed(1)
    d.push(`Q ${norm[i][0].toFixed(1)},${norm[i][1].toFixed(1)} ${mx},${my}`)
  }
  const last = norm[norm.length - 1]
  d.push(`L ${last[0].toFixed(1)},${last[1].toFixed(1)}`)

  return d.join(' ')
}

export function MapRoute({ seed, stroke, strokeWidth = 2.5 }: MapRouteProps) {
  const d = buildPath(seed)
  // Parse start / end coords from path string for dots
  const startM = d.match(/^M\s*([\d.]+),([\d.]+)/)
  const endL = d.match(/L\s*([\d.]+),([\d.]+)$/)
  const sx = startM ? parseFloat(startM[1]) : 10
  const sy = startM ? parseFloat(startM[2]) : 10
  const ex = endL ? parseFloat(endL[1]) : 90
  const ey = endL ? parseFloat(endL[2]) : 90

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
      {/* Soft glow behind the route */}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth * 3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.12}
      />
      {/* Main route line */}
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.92}
      />
      {/* Start dot */}
      <circle cx={sx} cy={sy} r={3} fill={stroke} opacity={0.9} />
      {/* End dot (finish) */}
      <circle cx={ex} cy={ey} r={3} fill={stroke} opacity={0.9} />
      <circle cx={ex} cy={ey} r={5.5} fill="none" stroke={stroke} strokeWidth={1.2} opacity={0.45} />
    </svg>
  )
}

