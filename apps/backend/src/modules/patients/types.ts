import type { z } from 'zod'
import type { patientIdParamSchema, patientHabitsQuerySchema, searchPatientsQuerySchema } from './schemas'

export type PatientIdParam = z.infer<typeof patientIdParamSchema>
export type PatientHabitsQuery = z.infer<typeof patientHabitsQuerySchema>
export type SearchPatientsQuery = z.infer<typeof searchPatientsQuerySchema>

export type PatientSearchDto = {
  id: string
  fullName: string
  email: string
}

export type PatientDto = {
  id: string
  fullName: string
  createdAt: string
}

export type HabitEntryDto = {
  id: string
  date: string
  waterIntakeMl: number
  exerciseMinutes: number
  sleepHours: number
  createdAt: string
  updatedAt: string
}
