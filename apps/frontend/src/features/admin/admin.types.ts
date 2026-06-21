import type { UserRole } from '@/features/auth/auth.types'

export interface AdminUserDto {
  id: string
  email: string
  role: UserRole
  fullName: string | null
  createdAt: string
}

export interface CreateAdminUserInput {
  email: string
  password: string
  role: UserRole
  fullName?: string
}
