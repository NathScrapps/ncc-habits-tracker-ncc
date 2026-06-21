import api from '@/lib/api-client'
import type { PatientDto, PatientHabitEntryDto } from '@/features/patients/patients.types'
import type { PatientSearchDto } from '@/features/nutritionists/nutritionists.types'

export async function getPatientsApi(): Promise<PatientDto[]> {
  const { data } = await api.get<PatientDto[]>('/nutritionist/patients')
  return data
}

export async function getPatientApi(patientId: string): Promise<PatientDto> {
  const { data } = await api.get<PatientDto>(`/nutritionist/patients/${patientId}`)
  return data
}

export async function getPatientHabitsApi(
  patientId: string,
  days = 30,
): Promise<PatientHabitEntryDto[]> {
  const { data } = await api.get<PatientHabitEntryDto[]>(
    `/nutritionist/patients/${patientId}/habits`,
    { params: { days } },
  )
  return data
}

export async function searchPatientsApi(q: string): Promise<PatientSearchDto[]> {
  const { data } = await api.get<PatientSearchDto[]>('/nutritionist/patients/search', {
    params: { q },
  })
  return data
}

export async function assignPatientApi(patientId: string): Promise<PatientDto> {
  const { data } = await api.post<PatientDto>(`/nutritionists/patients/${patientId}`)
  return data
}

export async function unassignPatientApi(patientId: string): Promise<void> {
  await api.delete(`/nutritionists/patients/${patientId}`)
}
