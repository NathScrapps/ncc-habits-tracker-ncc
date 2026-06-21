import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAdminUserApi } from '@/services/admin.service'
import type { CreateAdminUserInput } from '@/features/admin/admin.types'
import { ADMIN_USERS_QUERY_KEY } from './use-admin-users'

export function useCreateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAdminUserInput) => createAdminUserApi(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
  })
}
