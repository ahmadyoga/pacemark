export interface ActivitySummary {
  id: number
  name: string
  sport_type: string
  start_date: string
  distance: number
  moving_time: number
  total_elevation_gain: number
  average_speed: number
  average_heartrate?: number
  kilojoules?: number
  location_city?: string
  location_country?: string
  start_latlng?: [number, number]
  map?: { summary_polyline?: string; polyline?: string }
  splits_metric?: {
    distance: number
    moving_time: number
    average_speed: number
    pace_zone: number
  }[]
}

export interface DisplayActivity {
  id: number
  title: string
  date: string
  distance: string
  pace: string
  duration: string
  heartRate: string
  elevation: string
  calories: string
  city: string
  startTime: string
  routeSeed: number
  /** Projected SVG-space points (viewBox 0..100) for the activity's GPS trace. Empty for indoor/no-GPS activities. */
  routePoints: [number, number][]
  /** Projected SVG-space points (viewBox 0..200 × 0..60) of altitude vs distance. Empty when no streams. */
  elevationProfile: [number, number][]
  /** Display name of the authenticated athlete. Wired in from session on the detail route. */
  athleteName?: string
  fresh: boolean
  splits: { km: number; pace: string; speed: number; roundedKm: number }[]
}

/**
 * Resample (distance[], altitude[]) streams into SVG-space points fitting a 200×60 viewBox
 * (y=60 at the lowest altitude, y≈5 at the highest — 5px top padding). 60 samples is enough
 * for a smooth profile while keeping the SVG tiny.
 */
export function projectElevation(distance: number[], altitude: number[]): [number, number][] {
  if (!distance || !altitude || distance.length < 2 || altitude.length < 2) return []
  const n = Math.min(distance.length, altitude.length)
  const totalDist = distance[n - 1] - distance[0] || 1
  let minA = Infinity, maxA = -Infinity
  for (let i = 0; i < n; i++) {
    if (altitude[i] < minA) minA = altitude[i]
    if (altitude[i] > maxA) maxA = altitude[i]
  }
  const aRange = maxA - minA || 1
  const SAMPLES = 60
  const out: [number, number][] = []
  let i = 0
  for (let s = 0; s < SAMPLES; s++) {
    const t = s / (SAMPLES - 1)
    const targetDist = distance[0] + t * totalDist
    while (i < n - 2 && distance[i + 1] < targetDist) i++
    const d0 = distance[i], d1 = distance[i + 1] ?? d0
    const a0 = altitude[i], a1 = altitude[i + 1] ?? a0
    const u = d1 === d0 ? 0 : (targetDist - d0) / (d1 - d0)
    const alt = a0 + u * (a1 - a0)
    out.push([
      +(t * 200).toFixed(2),
      +(60 - ((alt - minA) / aRange) * 55).toFixed(2),
    ])
  }
  return out
}

/** Decode Google encoded polyline (Strava `map.summary_polyline`) → [lat, lng] pairs. */
export function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = []
  let index = 0, lat = 0, lng = 0
  while (index < encoded.length) {
    let b: number, shift = 0, result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lat += (result & 1) ? ~(result >> 1) : (result >> 1)
    shift = 0; result = 0
    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += (result & 1) ? ~(result >> 1) : (result >> 1)
    coords.push([lat * 1e-5, lng * 1e-5])
  }
  return coords
}

/**
 * Project [lat, lng] coords → SVG-space points fit into a 10..90 box inside a 100×100 viewBox.
 * Equirectangular: longitude scaled by cos(lat) so the route's aspect ratio isn't horizontally
 * stretched at non-equatorial latitudes. Y is flipped (north up).
 */
export function projectRoute(coords: [number, number][]): [number, number][] {
  if (coords.length < 2) return []
  const cosLat = Math.cos((coords[0][0] * Math.PI) / 180)
  const raw = coords.map(([la, lo]): [number, number] => [lo * cosLat, -la])
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const [x, y] of raw) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const w = maxX - minX || 1
  const h = maxY - minY || 1
  const scale = Math.min(80 / w, 80 / h)
  const ox = 10 + (80 - w * scale) / 2
  const oy = 10 + (80 - h * scale) / 2
  return raw.map(([x, y]): [number, number] => [
    +(ox + (x - minX) * scale).toFixed(2),
    +(oy + (y - minY) * scale).toFixed(2),
  ])
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatPace(metersPerSecond: number): string {
  if (metersPerSecond === 0) return '--:--'
  const secsPerKm = 1000 / metersPerSecond
  const rawS = Math.round(secsPerKm % 60)
  const carry = rawS === 60 ? 1 : 0
  const m = Math.floor(secsPerKm / 60) + carry
  const s = carry ? 0 : rawS
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1)
}

const cityCache = new Map<string, string>()
let resolveChain: Promise<unknown> = Promise.resolve()

export async function resolveCity(lat: number, lon: number): Promise<string> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`
  if (cityCache.has(cacheKey)) return cityCache.get(cacheKey)!

  const result = await (resolveChain = resolveChain.then(async () => {
    if (cityCache.has(cacheKey)) return cityCache.get(cacheKey)!

    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      )
      if (!res.ok) return 'Unknown'
      const data = await res.json()
      const city = data.city || data.locality || data.principalSubdivision || 'Unknown'
      cityCache.set(cacheKey, city)
      return city
    } catch (e) {
      console.error('Failed to resolve city:', e)
      return 'Unknown'
    }
  }))

  return result
}

export interface ActivityStreams {
  altitude?: { data: number[] }
  distance?: { data: number[] }
}

export async function toDisplayActivity(
  a: ActivitySummary,
  streams?: ActivityStreams,
  athleteName?: string,
): Promise<DisplayActivity> {
  const date = new Date(a.start_date)
  let city = a.location_city || a.location_country || 'Unknown'

  if ((!a.location_city || a.location_city === 'null') && a.start_latlng?.[0] != null && a.start_latlng?.[1] != null) {
    city = await resolveCity(a.start_latlng[0], a.start_latlng[1])
  }

  return {
    id: a.id,
    title: a.name,
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    distance: formatDistance(a.distance),
    pace: formatPace(a.average_speed),
    duration: formatDuration(a.moving_time),
    heartRate: a.average_heartrate ? String(Math.round(a.average_heartrate)) : '--',
    elevation: String(Math.round(a.total_elevation_gain)),
    calories: a.kilojoules ? String(Math.round(a.kilojoules)) : '--',
    city,
    startTime: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }),
    routeSeed: (a.id % 10) + 0.1,
    routePoints: a.map?.summary_polyline
      ? projectRoute(decodePolyline(a.map.summary_polyline))
      : [],
    elevationProfile: streams?.altitude?.data && streams?.distance?.data
      ? projectElevation(streams.distance.data, streams.altitude.data)
      : [],
    athleteName,
    fresh: Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000,
    // Strava guarantees splits_metric is ordered km 1..n
    splits: (a.splits_metric ?? []).map((s, i) => ({
      km: i + 1,
      pace: formatPace(s.average_speed),
      speed: s.average_speed,
      roundedKm: s.distance < 100 ? 0 : i + 1,
    })),
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_at: number
}> {
  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })
  if (!res.ok) throw new Error('refresh_failed')
  return res.json()
}

export async function getActivitiesFromStrava(
  accessToken: string,
  perPage = 30
): Promise<ActivitySummary[]> {
  const res = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`strava_api_error: ${res.status} ${body}`)
  }
  return res.json()
}

export async function getActivityFromStrava(
  accessToken: string,
  id: number
): Promise<ActivitySummary> {
  const res = await fetch(`https://www.strava.com/api/v3/activities/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('strava_api_error')
  return res.json()
}

/**
 * Fetch altitude + distance streams for a single activity. Returns an empty object if streams
 * aren't available (e.g. indoor activity, missing scope) — callers should treat that as "no data".
 */
export async function getActivityStreamsFromStrava(
  accessToken: string,
  id: number,
): Promise<ActivityStreams> {
  const res = await fetch(
    `https://www.strava.com/api/v3/activities/${id}/streams?keys=altitude,distance&key_by_type=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!res.ok) return {}
  return res.json()
}
