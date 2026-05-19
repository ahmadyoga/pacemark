/** @jest-environment node */
import { middleware } from '@/middleware'
import { NextRequest } from 'next/server'

function makeRequest(path: string, hasCookie = false) {
  const req = new NextRequest(`http://localhost:3000${path}`)
  if (hasCookie) {
    req.cookies.set('pacemark_session', 'some_value')
  }
  return req
}

describe('middleware', () => {
  it('redirects /picker to / when no session cookie', async () => {
    const res = await middleware(makeRequest('/picker'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/')
  })

  it('redirects /studio/123 to / when no session cookie', async () => {
    const res = await middleware(makeRequest('/studio/123'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/')
  })

  it('allows /picker through when session cookie exists', async () => {
    const res = await middleware(makeRequest('/picker', true))
    expect(res.status).toBe(200)
  })
})
