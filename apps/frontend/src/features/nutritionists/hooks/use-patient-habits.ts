import { useQuery } from '@tanstack/react-query'
import { getPatientHabitsApi } from '@/services/nutritionists.service'

export function usePatientHabits(patientId: string, days = 30) {
  return useQuery({
    queryKey: ['patients', patientId, 'habits', days],
    queryFn: () => getPatientHabitsApi(patientId, days),
    enabled: !!patientId,
  })
}
