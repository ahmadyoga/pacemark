import { render, screen } from '@testing-library/react'
import { StickerStaggeredStrips } from '@/components/stickers/StickerStaggeredStrips'
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

describe('StickerStaggeredStrips', () => {
  it('renders all three metrics and labels correctly', () => {
    render(<StickerStaggeredStrips run={run} visible={visible} accent="#FF5A1F" />)
    
    // Check for labels
    expect(screen.getByText('DISTANCE')).toBeInTheDocument()
    expect(screen.getByText('TIME')).toBeInTheDocument()
    expect(screen.getByText('PACE')).toBeInTheDocument()

    // Check for values
    expect(screen.getByText('10.2')).toBeInTheDocument()
    expect(screen.getByText('54:12')).toBeInTheDocument()
    expect(screen.getByText('5:32')).toBeInTheDocument()

    // Check for units
    expect(screen.getByText('KM')).toBeInTheDocument()
    expect(screen.getByText('/KM')).toBeInTheDocument()
  })
})
