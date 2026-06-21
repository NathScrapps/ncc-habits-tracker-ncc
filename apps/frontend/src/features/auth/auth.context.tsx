import { createContext, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { setAccessToken } from '@/lib/api-client'
import { refreshApi } from '@/services/auth.service'
import type { AuthUser } from './auth.types'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (accessToken: string, refreshToken: string, user: AuthUser) => void
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const initialized = useRef(false)

  const signIn = useCallback((accessToken: string, refreshToken: string, user: AuthUser) => {
    setAccessToken(accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }, [])

  const signOut = useCallback(() => {
    setAccessToken(null)
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  // Restore session on mount using stored refresh token
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUser = localStorage.getItem('user')

    if (!storedRefreshToken || !storedUser) {
      setIsLoading(false)
      return
    }

    refreshApi(storedRefreshToken)
      .then(({ accessToken }) => {
        const parsedUser = JSON.parse(storedUser) as AuthUser
        setAccessToken(accessToken)
        // Backend does not rotate the refresh token — keep the existing one in localStorage
        setUser(parsedUser)
      })
      .catch(() => {
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
