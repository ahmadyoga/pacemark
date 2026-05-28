import { render, screen } from '@testing-library/react'
import { StickerBigNumber } from '@/components/stickers/StickerBigNumber'
import type { DisplayActivity } from '@/lib/strava'

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, routePoints: [[10, 10], [50, 50], [90, 90]], elevationProfile: [], fresh: true, splits: [],
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

describe('StickerBigNumber', () => {
  it('renders the distance as hero number', () => {
    render(<StickerBigNumber run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('10.2')).toBeInTheDocument()
  })

  it('shows pace when visible', () => {
    render(<StickerBigNumber run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('5:32/km')).toBeInTheDocument()
  })
})
