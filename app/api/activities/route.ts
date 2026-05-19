import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import {
  refreshAccessToken,
  getActivitiesFromStrava,
  toDisplayActivity,
} from '@/lib/strava'

export async function GET() {
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
    const activities = await getActivitiesFromStrava(session.access_token)
    return NextResponse.json(activities.map(toDisplayActivity))
  } catch {
    return NextResponse.json({ error: 'strava_error' }, { status: 502 })
  }
}
