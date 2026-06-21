export interface PatientDto {
  id: string
  fullName: string
  createdAt: string
}

export interface PatientSearchDto {
  id: string
  fullName: string
  email: string
}

export interface PatientHabitEntryDto {
  id: string
  date: string
  waterIntakeMl: number
  exerciseMinutes: number
  sleepHours: number
  createdAt: string
  updatedAt: string
}
