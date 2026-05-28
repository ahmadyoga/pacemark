import { render, screen } from '@testing-library/react'
import { StickerVHSPlayback } from '@/components/stickers/StickerVHSPlayback'
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

describe('StickerVHSPlayback', () => {
  it('renders PLAY status and duration', () => {
    render(<StickerVHSPlayback run={mockRun} visible={{}} accent="#00ff00" />)
    expect(screen.getByText(/PLAY/i)).toBeInTheDocument()
    expect(screen.getByText(/00:54:12/i)).toBeInTheDocument()
    expect(screen.getByText(/MAY 28 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/CH 03/i)).toBeInTheDocument()
  })
})
