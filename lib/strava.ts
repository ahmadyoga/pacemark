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
  routeSeed: number
  fresh: boolean
  splits: { km: number; pace: string; speed: number }[]
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

export async function resolveCity(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`,
      {
        headers: {
          'User-Agent': 'Pacemark/1.0 (contact@pacemark.app)',
        },
      }
    )
    if (!res.ok) return 'Unknown'
    const data = await res.json()
    return data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Unknown'
  } catch (e) {
    console.error('Failed to resolve city:', e)
    return 'Unknown'
  }
}

export async function toDisplayActivity(a: ActivitySummary): Promise<DisplayActivity> {
  const date = new Date(a.start_date)
  let city = a.location_city || a.location_country || 'Unknown'
  
  if ((!a.location_city || a.location_city === 'null') && a.start_latlng) {
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
    routeSeed: (a.id % 10) + 0.1,
    fresh: Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000,
    splits: (a.splits_metric ?? []).map((s, i) => ({
      km: i + 1,
      pace: formatPace(s.average_speed),
      speed: s.average_speed,
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
  if (!res.ok) throw new Error('strava_api_error')
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
