export interface HabitEntryDto {
  id: string
  patientId: string
  date: string
  waterIntakeMl: number
  exerciseMinutes: number
  sleepHours: number
  createdAt: string
  updatedAt: string
}

export interface CreateHabitInput {
  date: string
  waterIntakeMl: number
  exerciseMinutes: number
  sleepHours: number
}

export interface UpdateHabitInput {
  waterIntakeMl?: number
  exerciseMinutes?: number
  sleepHours?: number
}
