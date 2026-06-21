import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HabitChart } from '../components/HabitChart'
import type { HabitEntryDto } from '../habits.types'

// Mock Recharts — SVG rendering is unreliable in jsdom
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => <div data-testid="area" />,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}))

const mockData: HabitEntryDto[] = [
  {
    id: '1',
    patientId: 'p1',
    date: '2026-06-18',
    waterIntakeMl: 1500,
    exerciseMinutes: 30,
    sleepHours: 7,
    createdAt: '2026-06-18T10:00:00.000Z',
    updatedAt: '2026-06-18T10:00:00.000Z',
  },
  {
    id: '2',
    patientId: 'p1',
    date: '2026-06-19',
    waterIntakeMl: 2000,
    exerciseMinutes: 45,
    sleepHours: 8,
    createdAt: '2026-06-19T10:00:00.000Z',
    updatedAt: '2026-06-19T10:00:00.000Z',
  },
]

describe('HabitChart', () => {
  it('renders chart label and area when data is provided', () => {
    render(
      <HabitChart data={mockData} dataKey="waterIntakeMl" label="Water (ml)" color="#3b82f6" unit="ml" />
    )
    expect(screen.getByText('Water (ml)')).toBeInTheDocument()
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.getByTestId('area')).toBeInTheDocument()
  })

  it('renders all three metric variants without crashing', () => {
    const { rerender } = render(
      <HabitChart data={mockData} dataKey="waterIntakeMl" label="Water (ml)" color="#3b82f6" unit="ml" />
    )
    rerender(
      <HabitChart data={mockData} dataKey="exerciseMinutes" label="Exercise (min)" color="#10b981" unit="min" />
    )
    expect(screen.getByText('Exercise (min)')).toBeInTheDocument()

    rerender(
      <HabitChart data={mockData} dataKey="sleepHours" label="Sleep (hrs)" color="#3b2a60" unit="hrs" />
    )
    expect(screen.getByText('Sleep (hrs)')).toBeInTheDocument()
  })

  it('shows empty state when data array is empty', () => {
    render(
      <HabitChart data={[]} dataKey="waterIntakeMl" label="Water (ml)" color="#3b82f6" unit="ml" />
    )
    expect(screen.getByText('Water (ml)')).toBeInTheDocument()
    expect(screen.getByText('No data yet')).toBeInTheDocument()
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
  })

  it('has accessible role and aria-label when data is present', () => {
    render(
      <HabitChart data={mockData} dataKey="sleepHours" label="Sleep (hrs)" color="#3b2a60" unit="hrs" />
    )
    expect(screen.getByRole('img', { name: 'Sleep (hrs) chart' })).toBeInTheDocument()
  })
})
