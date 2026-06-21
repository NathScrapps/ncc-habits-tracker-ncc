import api from '@/lib/api-client'
import type { AdminUserDto, CreateAdminUserInput } from '@/features/admin/admin.types'
import type { UserRole } from '@/features/auth/auth.types'

export async function createAdminUserApi(input: CreateAdminUserInput): Promise<AdminUserDto> {
  const { data } = await api.post<AdminUserDto>('/admin/users', input)
  return data
}

export async function listAdminUsersApi(role?: UserRole): Promise<AdminUserDto[]> {
  const { data } = await api.get<AdminUserDto[]>('/admin/users', {
    params: role ? { role } : undefined,
  })
  return data
}
