import { render, screen } from '@testing-library/react'
import { StickerCompleted } from '@/components/stickers/StickerCompleted'
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

describe('StickerCompleted', () => {
  it('renders completed badge text', () => {
    render(<StickerCompleted run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('ACTIVITY COMPLETED')).toBeInTheDocument()
  })

  it('renders checked status for distance target when distance is >= 5K', () => {
    render(<StickerCompleted run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('DISTANCE TARGET (5K+)')).toBeInTheDocument()
    expect(screen.getByText('10.2 km')).toBeInTheDocument()
  })

  it('renders date in footer', () => {
    render(<StickerCompleted run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('MAY 17')).toBeInTheDocument()
  })
})
