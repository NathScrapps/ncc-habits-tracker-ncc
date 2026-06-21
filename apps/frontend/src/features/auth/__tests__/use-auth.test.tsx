import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { AuthProvider } from '../auth.context'
import { useAuth } from '../hooks/use-auth'
import type { AuthUser } from '../auth.types'

vi.mock('@/services/auth.service', () => ({
  refreshApi: vi.fn().mockRejectedValue(new Error('No token')),
}))

const mockUser: AuthUser = { id: '1', email: 'test@example.com', role: 'PATIENT' }

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('throws when used outside AuthProvider', () => {
    // Suppress React error boundary noise in test output
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within <AuthProvider>')
    spy.mockRestore()
  })

  it('starts unauthenticated after session check completes', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('signIn sets user and isAuthenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.signIn('access-token', 'refresh-token', mockUser))

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token')
    expect(JSON.parse(localStorage.getItem('user') ?? '')).toEqual(mockUser)
  })

  it('signOut clears user and localStorage', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => result.current.signIn('access-token', 'refresh-token', mockUser))
    expect(result.current.isAuthenticated).toBe(true)

    act(() => result.current.signOut())
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
