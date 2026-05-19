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

export function toDisplayActivity(a: ActivitySummary): DisplayActivity {
  const date = new Date(a.start_date)
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
    city: a.location_city || a.location_country || 'Unknown',
    routeSeed: (a.id % 10) + 0.1,
    fresh: Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000,
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
