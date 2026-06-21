import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { useAssignPatient } from '../hooks/use-assign-patient'
import { assignPatientApi } from '@/services/patients.service'

vi.mock('@/services/patients.service', () => ({
  getPatientsApi: vi.fn(),
  getPatientApi: vi.fn(),
  getPatientHabitsApi: vi.fn(),
  assignPatientApi: vi.fn(),
  unassignPatientApi: vi.fn(),
}))

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children)
}

describe('useAssignPatient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls assignPatientApi with the patient id and succeeds', async () => {
    const dto = { id: 'p1', fullName: 'Bob', createdAt: '2024-01-01T00:00:00.000Z' }
    vi.mocked(assignPatientApi).mockResolvedValue(dto)

    const { result } = renderHook(() => useAssignPatient(), { wrapper: createWrapper() })
    act(() => { result.current.mutate('p1') })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(assignPatientApi).toHaveBeenCalledWith('p1')
  })

  it('is in error state when the API rejects', async () => {
    vi.mocked(assignPatientApi).mockRejectedValue(new Error('Not found'))
    const { result } = renderHook(() => useAssignPatient(), { wrapper: createWrapper() })
    act(() => { result.current.mutate('bad') })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
