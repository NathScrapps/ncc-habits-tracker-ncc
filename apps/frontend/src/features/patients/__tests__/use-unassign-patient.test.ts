import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { useUnassignPatient } from '../hooks/use-unassign-patient'
import { unassignPatientApi } from '@/services/patients.service'

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

describe('useUnassignPatient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls unassignPatientApi with the patient id and succeeds', async () => {
    vi.mocked(unassignPatientApi).mockResolvedValue(undefined)
    const { result } = renderHook(() => useUnassignPatient(), { wrapper: createWrapper() })
    act(() => { result.current.mutate('p1') })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(unassignPatientApi).toHaveBeenCalledWith('p1')
  })

  it('is in error state when the API rejects', async () => {
    vi.mocked(unassignPatientApi).mockRejectedValue(new Error('Forbidden'))
    const { result } = renderHook(() => useUnassignPatient(), { wrapper: createWrapper() })
    act(() => { result.current.mutate('p1') })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
