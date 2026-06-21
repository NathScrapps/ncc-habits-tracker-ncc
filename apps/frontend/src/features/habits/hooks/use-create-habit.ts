import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createHabitApi } from '@/services/habits.service'
import { HABITS_QUERY_KEY } from './use-habits'

export function useCreateHabit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createHabitApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_QUERY_KEY })
    },
  })
}
