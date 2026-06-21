import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { usePatient } from '../hooks/use-patient'
import { getPatientApi } from '@/services/nutritionists.service'
import type { PatientDto } from '../nutritionists.types'

vi.mock('@/services/nutritionists.service', () => ({
  getPatientsApi: vi.fn(),
  getPatientApi: vi.fn(),
  getPatientHabitsApi: vi.fn(),
  assignPatientApi: vi.fn(),
  unassignPatientApi: vi.fn(),
}))

const mockPatient: PatientDto = {
  id: 'patient-uuid-1',
  fullName: 'Bob Smith',
  createdAt: '2024-01-15T00:00:00.000Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('usePatient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('is in loading state initially when patientId is provided', () => {
    vi.mocked(getPatientApi).mockResolvedValue(mockPatient)
    const { result } = renderHook(() => usePatient('patient-uuid-1'), {
      wrapper: createWrapper(),
    })
    expect(result.current.isLoading).toBe(true)
  })

  it('returns the patient on success', async () => {
    vi.mocked(getPatientApi).mockResolvedValue(mockPatient)
    const { result } = renderHook(() => usePatient('patient-uuid-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPatient)
    expect(getPatientApi).toHaveBeenCalledWith('patient-uuid-1')
  })

  it('is disabled and never fetches when patientId is empty', () => {
    const { result } = renderHook(() => usePatient(''), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(false)
    expect(getPatientApi).not.toHaveBeenCalled()
  })

  it('returns isError when the API rejects', async () => {
    vi.mocked(getPatientApi).mockRejectedValue(new Error('Forbidden'))
    const { result } = renderHook(() => usePatient('patient-uuid-1'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
