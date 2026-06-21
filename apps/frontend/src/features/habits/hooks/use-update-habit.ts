import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateHabitApi } from '@/services/habits.service'
import type { UpdateHabitInput } from '@/features/habits/habits.types'
import { HABITS_QUERY_KEY } from './use-habits'

export function useUpdateHabit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitInput }) => updateHabitApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY })
    },
  })
}
