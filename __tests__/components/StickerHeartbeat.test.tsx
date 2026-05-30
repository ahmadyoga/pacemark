import { render, screen } from '@testing-library/react'
import { StickerHeartbeat } from '@/components/stickers/StickerHeartbeat'
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
  heartRate: true, elevation: true, calories: false, city: true,
}

describe('StickerHeartbeat', () => {
  it('renders heartbeat title', () => {
    render(<StickerHeartbeat run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('HEARTBEAT SUMMARY')).toBeInTheDocument()
  })

  it('renders heart rate metric when visible', () => {
    render(<StickerHeartbeat run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('142')).toBeInTheDocument()
    expect(screen.getByText('BPM')).toBeInTheDocument()
  })

  it('renders flatline status when heart rate is absent', () => {
    render(<StickerHeartbeat run={{ ...run, heartRate: '--' }} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('▲ FLATLINE / OFFLINE')).toBeInTheDocument()
  })
})
