import { render, screen } from '@testing-library/react'
import { StickerVerified } from '@/components/stickers/StickerVerified'
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

describe('StickerVerified', () => {
  it('renders verified badges and labels', () => {
    render(<StickerVerified run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('PACEMARK VERIFIED')).toBeInTheDocument()
    expect(screen.getByText('OFFICIAL STRAVA RECORD')).toBeInTheDocument()
  })

  it('renders stats', () => {
    render(<StickerVerified run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('10.2K')).toBeInTheDocument()
    expect(screen.getByText('5:32')).toBeInTheDocument()
  })
})
