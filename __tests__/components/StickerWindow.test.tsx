import { render, screen } from '@testing-library/react'
import { StickerWindow } from '@/components/stickers/StickerWindow'
import type { DisplayActivity } from '@/lib/strava'

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
  splits: [],
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

describe('StickerWindow', () => {
  it('renders vintage window title bar and script command', () => {
    render(<StickerWindow run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('RUN_SESSION.SH')).toBeInTheDocument()
    expect(screen.getByText('cat metrics.json')).toBeInTheDocument()
  })

  it('renders key value properties formatted as JSON properties', () => {
    render(<StickerWindow run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('"distance":')).toBeInTheDocument()
    expect(screen.getByText('"10.2 km"')).toBeInTheDocument()
    expect(screen.getByText('"avg_pace":')).toBeInTheDocument()
    expect(screen.getByText('"5:32/km"')).toBeInTheDocument()
  })
})
