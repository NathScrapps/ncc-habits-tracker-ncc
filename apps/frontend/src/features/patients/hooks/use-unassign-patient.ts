import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unassignPatientApi } from '@/services/patients.service'
import { PATIENTS_QUERY_KEY } from './use-patients'

export function useUnassignPatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patientId: string) => unassignPatientApi(patientId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY }),
  })
}
