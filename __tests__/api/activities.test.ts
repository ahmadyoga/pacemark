/**
 * @jest-environment node
 */
import { GET } from '@/app/api/activities/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/session', () => ({
  getSession: jest.fn(),
}))

jest.mock('@/lib/strava', () => ({
  ...jest.requireActual('@/lib/strava'),
  refreshAccessToken: jest.fn(),
  getActivitiesFromStrava: jest.fn(),
}))

import { getSession } from '@/lib/session'
import { refreshAccessToken, getActivitiesFromStrava } from '@/lib/strava'

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>
const mockRefresh = refreshAccessToken as jest.MockedFunction<typeof refreshAccessToken>
const mockGetActivities = getActivitiesFromStrava as jest.MockedFunction<typeof getActivitiesFromStrava>

describe('GET /api/activities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when session has no token', async () => {
    mockGetSession.mockResolvedValue({ access_token: undefined } as any)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns activities when token is fresh', async () => {
    mockGetSession.mockResolvedValue({
      access_token: 'tok',
      refresh_token: 'ref',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      save: jest.fn(),
    } as any)
    mockGetActivities.mockResolvedValue([{
      id: 1,
      name: 'Test Run',
      sport_type: 'Run',
      start_date: '2026-05-17T03:00:00Z',
      distance: 10200,
      moving_time: 3252,
      total_elevation_gain: 88,
      average_speed: 3.0,
    }])
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].distance).toBe('10.2')
  })

  it('refreshes token when expired', async () => {
    const mockSave = jest.fn()
    mockGetSession.mockResolvedValue({
      access_token: 'old_tok',
      refresh_token: 'ref',
      expires_at: Math.floor(Date.now() / 1000) - 10,
      save: mockSave,
    } as any)
    mockRefresh.mockResolvedValue({
      access_token: 'new_tok',
      refresh_token: 'new_ref',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    })
    mockGetActivities.mockResolvedValue([])
    await GET()
    expect(mockRefresh).toHaveBeenCalledWith('ref')
    expect(mockSave).toHaveBeenCalled()
  })
})
