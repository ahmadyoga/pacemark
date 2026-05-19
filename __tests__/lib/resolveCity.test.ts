import { resolveCity } from '@/lib/strava'

describe('resolveCity', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('resolves city name from BigDataCloud', async () => {
    const mockResponse = {
      city: 'Bandung',
      locality: 'Kecamatan Bandung Wetan',
    }
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    })

    const city = await resolveCity(-6.90, 107.62)
    expect(city).toBe('Bandung')
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('api.bigdatacloud.net')
    )
  })

  it('uses locality if city is missing', async () => {
    const mockResponse = {
      city: '',
      locality: 'Some Town',
    }
    
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    })

    const city = await resolveCity(-7.00, 108.00)
    expect(city).toBe('Some Town')
  })

  it('uses cache for same coordinates', async () => {
    const mockResponse = { city: 'Cached City' }
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    })
    global.fetch = mockFetch

    // First call
    const city1 = await resolveCity(-1.00, 100.00)
    expect(city1).toBe('Cached City')
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Second call (should be cached)
    const city2 = await resolveCity(-1.00, 100.00)
    expect(city2).toBe('Cached City')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('rounds coordinates to 2 decimal places for cache', async () => {
    const mockResponse = { city: 'Rounded City' }
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    })
    global.fetch = mockFetch

    await resolveCity(-1.123, 100.456)
    await resolveCity(-1.124, 100.457) // Both round to -1.12, 100.46

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('handles fetch errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    
    const city = await resolveCity(-2.00, 110.00)
    expect(city).toBe('Unknown')
  })
})
