import api from '@/lib/api-client'
import type { LoginInput, LoginResponse, RefreshResponse, RegisterInput } from '@/features/auth/auth.types'

export async function loginApi(input: LoginInput): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', input)
  return data
}

export async function registerApi(input: RegisterInput): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/auth/register', input)
  return data
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await api.post('/auth/logout', { refreshToken })
}

export async function refreshApi(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await api.post<RefreshResponse>('/auth/refresh', { refreshToken })
  return data
}
