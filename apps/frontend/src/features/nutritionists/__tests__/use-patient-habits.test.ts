import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { usePatientHabits } from '../hooks/use-patient-habits'
import { getPatientHabitsApi } from '@/services/nutritionists.service'
import type { PatientHabitEntryDto } from '../nutritionists.types'

vi.mock('@/services/nutritionists.service', () => ({
  getPatientsApi: vi.fn(),
  getPatientApi: vi.fn(),
  getPatientHabitsApi: vi.fn(),
  assignPatientApi: vi.fn(),
  unassignPatientApi: vi.fn(),
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('usePatientHabits', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns habit entries for the patient', async () => {
    vi.mocked(getPatientHabitsApi).mockResolvedValue(mockHabits)
    const { result } = renderHook(() => usePatientHabits('patient-uuid-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockHabits)
    expect(getPatientHabitsApi).toHaveBeenCalledWith('patient-uuid-1', 30)
  })

  it('passes a custom days parameter to the API', async () => {
    vi.mocked(getPatientHabitsApi).mockResolvedValue([])
    const { result } = renderHook(() => usePatientHabits('patient-uuid-1', 7), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(getPatientHabitsApi).toHaveBeenCalledWith('patient-uuid-1', 7)
  })

  it('is disabled when patientId is empty', () => {
    const { result } = renderHook(() => usePatientHabits(''), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(false)
    expect(getPatientHabitsApi).not.toHaveBeenCalled()
  })

  it('returns isError when the API rejects', async () => {
    vi.mocked(getPatientHabitsApi).mockRejectedValue(new Error('Forbidden'))
    const { result } = renderHook(() => usePatientHabits('patient-uuid-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
