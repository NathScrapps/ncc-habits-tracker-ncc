import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import React from 'react'
import { useCreateAdminUser } from '../hooks/use-create-admin-user'
import { createAdminUserApi } from '@/services/admin.service'

vi.mock('@/services/admin.service', () => ({
  createAdminUserApi: vi.fn(),
  listAdminUsersApi: vi.fn().mockResolvedValue([]),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockCreate = vi.mocked(createAdminUserApi)

const newPatient = {
  email: 'patient@test.com',
  password: 'secret123',
  role: 'PATIENT' as const,
  fullName: 'Jane Doe',
}

const createdUser = {
  id: 'u-1',
  email: 'patient@test.com',
  role: 'PATIENT' as const,
  fullName: 'Jane Doe',
  createdAt: '2026-06-21T00:00:00.000Z',
}

describe('useCreateAdminUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns created user on success', async () => {
    mockCreate.mockResolvedValueOnce(createdUser)
    const { result } = renderHook(() => useCreateAdminUser(), { wrapper: createWrapper() })

    result.current.mutate(newPatient)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(createdUser)
    expect(mockCreate).toHaveBeenCalledWith(newPatient)
  })

  it('exposes error state on failure', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Email already in use'))
    const { result } = renderHook(() => useCreateAdminUser(), { wrapper: createWrapper() })

    result.current.mutate(newPatient)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
    expect((result.current.error as Error).message).toBe('Email already in use')
  })

  it('creates ADMIN user without fullName', async () => {
    const adminUser = { id: 'u-2', email: 'admin@test.com', role: 'ADMIN' as const, fullName: null, createdAt: '2026-06-21T00:00:00.000Z' }
    mockCreate.mockResolvedValueOnce(adminUser)
    const { result } = renderHook(() => useCreateAdminUser(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'admin@test.com', password: 'adminpass1', role: 'ADMIN' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.fullName).toBeNull()
  })
})
