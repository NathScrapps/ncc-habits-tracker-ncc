import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assignPatientApi } from '@/services/nutritionists.service'
import { PATIENTS_QUERY_KEY } from './use-patients'

export function useAssignPatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patientId: string) => assignPatientApi(patientId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY }),
  })
}
