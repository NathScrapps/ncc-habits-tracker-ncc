import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { useUpdateHabit } from '../hooks/use-update-habit'
import { updateHabitApi } from '@/services/habits.service'

vi.mock('@/services/habits.service', () => ({
  getHabitsApi: vi.fn(),
  createHabitApi: vi.fn(),
  updateHabitApi: vi.fn(),
}))

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children)
}

const mockUpdated = {
  id: 'habit-1',
  patientId: 'p1',
  date: '2026-06-21',
  waterIntakeMl: 3000,
  exerciseMinutes: 60,
  sleepHours: 8,
  createdAt: '2026-06-21T10:00:00.000Z',
  updatedAt: '2026-06-21T12:00:00.000Z',
}

describe('useUpdateHabit', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls updateHabitApi with id and data and returns the updated entry', async () => {
    vi.mocked(updateHabitApi).mockResolvedValue(mockUpdated)

    const { result } = renderHook(() => useUpdateHabit(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ id: 'habit-1', data: { waterIntakeMl: 3000 } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(updateHabitApi).toHaveBeenCalledWith('habit-1', { waterIntakeMl: 3000 })
    expect(result.current.data).toEqual(mockUpdated)
  })

  it('is in error state when the API rejects', async () => {
    vi.mocked(updateHabitApi).mockRejectedValue(new Error('Forbidden'))

    const { result } = renderHook(() => useUpdateHabit(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ id: 'habit-1', data: { waterIntakeMl: 3000 } })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('supports partial updates with only one field', async () => {
    vi.mocked(updateHabitApi).mockResolvedValue(mockUpdated)

    const { result } = renderHook(() => useUpdateHabit(), { wrapper: createWrapper() })

    act(() => {
      result.current.mutate({ id: 'habit-1', data: { sleepHours: 9 } })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(updateHabitApi).toHaveBeenCalledWith('habit-1', { sleepHours: 9 })
  })
})
