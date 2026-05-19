import { render, screen } from '@testing-library/react'
import { StickerPaceSplits } from '@/components/stickers/StickerPaceSplits'
import type { DisplayActivity } from '@/lib/strava'

const run: DisplayActivity = {
  id: 1, title: 'Morning Run', date: 'May 17',
  distance: '10.2', pace: '5:32', duration: '54:12',
  heartRate: '142', elevation: '88', calories: '612',
  city: 'Jakarta', routeSeed: 3.1, fresh: true,
  splits: [
    { km: 1, pace: '5:42', speed: 2.92, roundedKm: 1 },
    { km: 2, pace: '5:35', speed: 2.99, roundedKm: 2 },
    { km: 3, pace: '5:28', speed: 3.05, roundedKm: 3 },
  ],
}

const visible = {
  distance: true, pace: true, duration: true,
  heartRate: false, elevation: true, calories: false, city: true,
}

describe('StickerPaceSplits', () => {
  it('renders pace for each split', () => {
    render(<StickerPaceSplits run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('5:42')).toBeInTheDocument()
    expect(screen.getByText('5:35')).toBeInTheDocument()
    expect(screen.getByText('5:28')).toBeInTheDocument()
  })

  it('renders km numbers', () => {
    render(<StickerPaceSplits run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows fallback message when splits is empty', () => {
    render(<StickerPaceSplits run={{ ...run, splits: [] }} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('No split data available')).toBeInTheDocument()
  })

  it('shows at most 8 splits', () => {
    const manySplits = Array.from({ length: 12 }, (_, i) => ({
      km: i + 1,
      pace: '5:30',
      speed: 3.03,
      roundedKm: i + 1,
    }))
    render(<StickerPaceSplits run={{ ...run, splits: manySplits }} visible={visible} accent="#FF5A1F" />)
    const rows = document.querySelectorAll('.ovl-ps-row')
    expect(rows).toHaveLength(8)
  })
})
