import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { useHabits } from '../hooks/use-habits'
import { getHabitsApi } from '@/services/habits.service'
import type { HabitEntryDto } from '../habits.types'

vi.mock('@/services/habits.service', () => ({
  getHabitsApi: vi.fn(),
  createHabitApi: vi.fn(),
}))

const mockHabits: HabitEntryDto[] = [
  {
    id: '1',
    patientId: 'p1',
    date: '2026-06-20',
    waterIntakeMl: 2000,
    exerciseMinutes: 30,
    sleepHours: 7.5,
    createdAt: '2026-06-20T10:00:00.000Z',
    updatedAt: '2026-06-20T10:00:00.000Z',
  },
]

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useHabits', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is in loading state initially', () => {
    vi.mocked(getHabitsApi).mockResolvedValue(mockHabits)
    const { result } = renderHook(() => useHabits(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('returns habits on success', async () => {
    vi.mocked(getHabitsApi).mockResolvedValue(mockHabits)
    const { result } = renderHook(() => useHabits(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockHabits)
    expect(getHabitsApi).toHaveBeenCalledWith({})
  })

  it('passes days param as object to the API', async () => {
    vi.mocked(getHabitsApi).mockResolvedValue([])
    const { result } = renderHook(() => useHabits({ days: 7 }), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getHabitsApi).toHaveBeenCalledWith({ days: 7 })
  })

  it('passes from/to date filter params to the API', async () => {
    vi.mocked(getHabitsApi).mockResolvedValue(mockHabits)
    const { result } = renderHook(
      () => useHabits({ from: '2026-06-01', to: '2026-06-21' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getHabitsApi).toHaveBeenCalledWith({ from: '2026-06-01', to: '2026-06-21' })
  })

  it('returns empty array and isError on API failure', async () => {
    vi.mocked(getHabitsApi).mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useHabits(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})
