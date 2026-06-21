import { useQuery } from '@tanstack/react-query'
import { getPatientApi } from '@/services/patients.service'

export function usePatient(patientId: string) {
  return useQuery({
    queryKey: ['patients', patientId],
    queryFn: () => getPatientApi(patientId),
    enabled: !!patientId,
  })
}
