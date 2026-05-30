import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  refreshAccessToken,
  getActivityFromStrava,
  getActivityStreamsFromStrava,
  toDisplayActivity,
  type DisplayActivity,
} from '@/lib/strava'

// ── E2E test fixture ────────────────────────────────────────────────────────
// Used by the Puppeteer comparison script (compare-all-stickers.js).
// Returns realistic mock data so every sticker template renders fully without
// needing a live Strava session.
const E2E_MOCK_ACTIVITY: DisplayActivity = {
  id: 18689236960,
  title: 'Evening Run',
  date: 'May 28',
  distance: '17.0',
  pace: '7:05',
  duration: '2:00:20',
  heartRate: '158',
  elevation: '142',
  calories: '1240',
  city: 'Bandung',
  startTime: '06:40:45 PM',
  routeSeed: 1.1,
  routePoints: [
    [10,50],[15,40],[22,35],[30,30],[40,28],[50,32],[58,40],[65,50],
    [70,60],[75,65],[80,58],[85,48],[88,38],[90,30],[88,22],[82,18],
    [75,20],[68,28],[60,38],[52,45],[44,50],[36,48],[28,42],[20,48],[12,52],[10,50],
  ],
  elevationProfile: Array.from({ length: 60 }, (_, i) => {
    const t = i / 59
    const y = 30 + Math.sin(t * Math.PI * 3) * 18 + Math.cos(t * Math.PI * 7) * 6
    return [+(t * 200).toFixed(1), +y.toFixed(1)] as [number, number]
  }),
  athleteName: 'Ahmad Yoga',
  fresh: true,
  splits: Array.from({ length: 17 }, (_, i) => ({
    km: i + 1,
    pace: `${6 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    speed: 2.35,
    roundedKm: i + 1,
  })),
}
// ───────────────────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params
  const id = parseInt(runId, 10)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'invalid_id' }, { status: 400 })
  }

  // E2E bypass: Puppeteer sends this header so we skip the real Strava session.
  const e2eSecret = process.env.E2E_SECRET
  if (e2eSecret && request.headers.get('x-e2e-test') === e2eSecret) {
    return NextResponse.json({ ...E2E_MOCK_ACTIVITY, id })
  }

  const session = await getSession()

  if (!session.access_token || !session.refresh_token || !session.expires_at) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  if (Date.now() / 1000 >= session.expires_at - 60) {
    try {
      const tokens = await refreshAccessToken(session.refresh_token)
      session.access_token = tokens.access_token
      session.refresh_token = tokens.refresh_token
      session.expires_at = tokens.expires_at
      await session.save()
    } catch {
      return NextResponse.json({ error: 'token_refresh_failed' }, { status: 401 })
    }
  }

  try {
    const [activity, streams] = await Promise.all([
      getActivityFromStrava(session.access_token, id),
      getActivityStreamsFromStrava(session.access_token, id),
    ])
    return NextResponse.json(await toDisplayActivity(activity, streams, session.athlete_name))
  } catch {
    return NextResponse.json({ error: 'strava_error' }, { status: 502 })
  }
}

