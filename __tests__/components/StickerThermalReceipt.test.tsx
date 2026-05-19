import { render, screen } from '@testing-library/react'
import { StickerThermalReceipt } from '@/components/stickers/StickerThermalReceipt'
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

describe('StickerThermalReceipt', () => {
  it('renders PACEMARK brand header', () => {
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('PACEMARK')).toBeInTheDocument()
  })

  it('renders activity title', () => {
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('Morning Run')).toBeInTheDocument()
  })

  it('renders distance stat', () => {
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('10.2 KM')).toBeInTheDocument()
  })

  it('renders execution score capped at 100', () => {
    // distance 10.2 → Math.min(100, Math.round(10.2 * 10)) = Math.min(100, 102) = 100
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('100 / 100')).toBeInTheDocument()
  })

  it('renders thank you footer', () => {
    render(<StickerThermalReceipt run={run} visible={visible} accent="#FF5A1F" />)
    expect(screen.getByText('THANK YOU FOR YOUR RUN')).toBeInTheDocument()
  })
})
