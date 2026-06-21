import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { useAssignPatient } from '../hooks/use-assign-patient'
import { assignPatientApi, getPatientsApi } from '@/services/nutritionists.service'

vi.mock('@/services/nutritionists.service', () => ({
  getPatientsApi: vi.fn(),
  getPatientApi: vi.fn(),
  getPatientHabitsApi: vi.fn(),
  assignPatientApi: vi.fn(),
  unassignPatientApi: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useAssignPatient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls assignPatientApi with the provided patient id', async () => {
    const assigned = { id: 'patient-1', fullName: 'Bob', createdAt: '2024-01-01T00:00:00.000Z' }
    vi.mocked(assignPatientApi).mockResolvedValue(assigned)
    vi.mocked(getPatientsApi).mockResolvedValue([assigned])

    const { result } = renderHook(() => useAssignPatient(), { wrapper: createWrapper() })

    act(() => { result.current.mutate('patient-1') })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(assignPatientApi).toHaveBeenCalledWith('patient-1')
  })

  it('is in error state when the API rejects', async () => {
    vi.mocked(assignPatientApi).mockRejectedValue(new Error('Patient not found'))

    const { result } = renderHook(() => useAssignPatient(), { wrapper: createWrapper() })

    act(() => { result.current.mutate('bad-id') })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
