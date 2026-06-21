import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { usePatients } from '../hooks/use-patients'
import { getPatientsApi } from '@/services/patients.service'
import type { PatientDto } from '../patients.types'

vi.mock('@/services/patients.service', () => ({
  getPatientsApi: vi.fn(),
  getPatientApi: vi.fn(),
  getPatientHabitsApi: vi.fn(),
  assignPatientApi: vi.fn(),
  unassignPatientApi: vi.fn(),
}))

const mockPatients: PatientDto[] = [
  { id: 'p1', fullName: 'Bob Smith', createdAt: '2024-01-15T00:00:00.000Z' },
  { id: 'p2', fullName: 'Carol Jones', createdAt: '2024-02-01T00:00:00.000Z' },
]

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children)
}

describe('usePatients', () => {
  beforeEach(() => vi.clearAllMocks())

  it('is in loading state initially', () => {
    vi.mocked(getPatientsApi).mockResolvedValue(mockPatients)
    const { result } = renderHook(() => usePatients(), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('returns the list of patients on success', async () => {
    vi.mocked(getPatientsApi).mockResolvedValue(mockPatients)
    const { result } = renderHook(() => usePatients(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPatients)
  })

  it('returns isError on API failure', async () => {
    vi.mocked(getPatientsApi).mockRejectedValue(new Error('Forbidden'))
    const { result } = renderHook(() => usePatients(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
