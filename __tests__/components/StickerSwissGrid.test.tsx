import { render, screen } from '@testing-library/react'
import { StickerSwissGrid } from '@/components/stickers/StickerSwissGrid'
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

describe('StickerSwissGrid', () => {
  it('renders brand heading and massive distance metric', () => {
    render(<StickerSwissGrid run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('SWISS LABS // VOL. 04')).toBeInTheDocument()
    expect(screen.getByText('10.2')).toBeInTheDocument()
    expect(screen.getByText('KM')).toBeInTheDocument()
  })

  it('renders detailed sub-metrics with grid labels', () => {
    render(<StickerSwissGrid run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('AVERAGE PACE')).toBeInTheDocument()
    expect(screen.getByText('5:32/km')).toBeInTheDocument()
    expect(screen.getByText('ELAPSED TIME')).toBeInTheDocument()
    expect(screen.getByText('54:12')).toBeInTheDocument()
  })
})
