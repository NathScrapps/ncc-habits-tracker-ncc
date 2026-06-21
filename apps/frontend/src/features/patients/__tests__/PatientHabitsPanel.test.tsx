import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PatientHabitsPanel } from '../components/PatientHabitsPanel'
import type { PatientHabitEntryDto } from '../patients.types'

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

const mockHabits: PatientHabitEntryDto[] = [
  {
    id: 'h1',
    date: '2026-06-15',
    waterIntakeMl: 2000,
    exerciseMinutes: 45,
    sleepHours: 8,
    createdAt: '2026-06-15T10:00:00.000Z',
    updatedAt: '2026-06-15T10:00:00.000Z',
  },
]

describe('PatientHabitsPanel', () => {
  it('shows an empty-state message when there are no habits', () => {
    render(<PatientHabitsPanel habits={[]} />)
    expect(screen.getByText(/no habit entries yet/i)).toBeInTheDocument()
  })

  it('renders chart labels for all three metrics when habits exist', () => {
    render(<PatientHabitsPanel habits={mockHabits} />)
    expect(screen.getByText('Water (ml)')).toBeInTheDocument()
    expect(screen.getByText('Exercise (min)')).toBeInTheDocument()
    expect(screen.getByText('Sleep (hrs)')).toBeInTheDocument()
  })

  it('renders three accessible chart containers', () => {
    render(<PatientHabitsPanel habits={mockHabits} />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  it('renders no charts when the habits array is empty', () => {
    render(<PatientHabitsPanel habits={[]} />)
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })
})
