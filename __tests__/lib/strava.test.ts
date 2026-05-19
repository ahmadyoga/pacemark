import {
  formatDuration,
  formatPace,
  formatDistance,
  toDisplayActivity,
  type ActivitySummary,
} from '@/lib/strava'

describe('formatDuration', () => {
  it('formats seconds under 1 hour as mm:ss', () => {
    expect(formatDuration(3252)).toBe('54:12')
  })
  it('formats seconds over 1 hour as h:mm:ss', () => {
    expect(formatDuration(7412)).toBe('2:03:32')
  })
  it('pads minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05')
  })
})

describe('formatPace', () => {
  it('converts m/s to min:sec per km', () => {
    expect(formatPace(3.0)).toBe('5:33')
  })
  it('returns --:-- for zero speed', () => {
    expect(formatPace(0)).toBe('--:--')
  })
})

describe('formatDistance', () => {
  it('converts meters to km with 1 decimal', () => {
    expect(formatDistance(10200)).toBe('10.2')
  })
  it('rounds correctly', () => {
    expect(formatDistance(6400)).toBe('6.4')
  })
})

describe('toDisplayActivity', () => {
  const base: ActivitySummary = {
    id: 7,
    name: 'Morning Run',
    sport_type: 'Run',
    start_date: '2026-05-17T03:00:00Z',
    distance: 10200,
    moving_time: 3252,
    total_elevation_gain: 88,
    average_speed: 3.0,
    average_heartrate: 142,
    kilojoules: 612,
  }

  it('formats distance', async () => {
    const display = await toDisplayActivity(base)
    expect(display.distance).toBe('10.2')
  })
  it('formats duration', async () => {
    const display = await toDisplayActivity(base)
    expect(display.duration).toBe('54:12')
  })
  it('formats heartRate', async () => {
    const display = await toDisplayActivity(base)
    expect(display.heartRate).toBe('142')
  })
  it('formats elevation', async () => {
    const display = await toDisplayActivity(base)
    expect(display.elevation).toBe('88')
  })
  it('uses -- when heartRate is missing', async () => {
    const display = await toDisplayActivity({ ...base, average_heartrate: undefined })
    expect(display.heartRate).toBe('--')
  })

  it('maps splits_metric to splits array', async () => {
    const withSplits: ActivitySummary = {
      ...base,
      splits_metric: [
        { distance: 1000, moving_time: 342, average_speed: 2.92, pace_zone: 2 },
        { distance: 1000, moving_time: 335, average_speed: 2.99, pace_zone: 2 },
      ],
    }
    const display = await toDisplayActivity(withSplits)
    expect(display.splits).toHaveLength(2)
    expect(display.splits[0].km).toBe(1)
    expect(display.splits[1].km).toBe(2)
    expect(display.splits[0].pace).toBe(formatPace(2.92))
    expect(display.splits[0].speed).toBe(2.92)
  })

  it('sets splits to [] when splits_metric is absent', async () => {
    const display = await toDisplayActivity(base)
    expect(display.splits).toEqual([])
  })
})
