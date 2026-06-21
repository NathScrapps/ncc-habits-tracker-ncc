import { useQuery } from '@tanstack/react-query'
import { listAdminUsersApi } from '@/services/admin.service'
import type { UserRole } from '@/features/auth/auth.types'

export const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const

export function useAdminUsers(role?: UserRole) {
  return useQuery({
    queryKey: [...ADMIN_USERS_QUERY_KEY, role],
    queryFn: () => listAdminUsersApi(role),
  })
}
