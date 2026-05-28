import { render, screen } from '@testing-library/react'
import { StickerVHSCamcorder } from '@/components/stickers/StickerVHSCamcorder'
import { DisplayActivity } from '@/lib/strava'

const mockRun: DisplayActivity = {
  id: 1,
  title: 'Morning Run',
  date: 'MAY 28 2026',
  distance: '10.2',
  pace: '5:32',
  duration: '00:54:12',
  heartRate: '142',
  elevation: '88',
  calories: '612',
  city: 'Jakarta',
  routeSeed: 3.1,
  fresh: true,
  splits: [],
  routePoints: [],
  elevationProfile: [],
}

describe('StickerVHSCamcorder', () => {
  it('renders REC indicator and date', () => {
    render(<StickerVHSCamcorder run={mockRun} visible={{}} accent="#ff5a1f" />)
    expect(screen.getByText(/REC/i)).toBeInTheDocument()
    expect(screen.getByText(/MAY 28 2026/i)).toBeInTheDocument()
  })
})
