import { useQuery } from '@tanstack/react-query'
import { getPatientsApi } from '@/services/nutritionists.service'

export const PATIENTS_QUERY_KEY = ['patients'] as const

export function usePatients() {
  return useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: getPatientsApi,
  })
}
