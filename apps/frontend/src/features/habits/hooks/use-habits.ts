import { useQuery } from '@tanstack/react-query'
import { getHabitsApi, type GetHabitsParams } from '@/services/habits.service'

export const HABITS_QUERY_KEY = ['habits'] as const

export function useHabits(params?: GetHabitsParams) {
  const resolvedParams = params ?? {}
  return useQuery({
    queryKey: [...HABITS_QUERY_KEY, resolvedParams],
    queryFn: () => getHabitsApi(resolvedParams),
  })
}
