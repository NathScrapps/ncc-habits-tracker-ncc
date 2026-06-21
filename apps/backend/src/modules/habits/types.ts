import type { z } from 'zod'
import type { createHabitSchema, getHabitsQuerySchema, habitIdParamSchema, updateHabitSchema } from './schemas'

export type CreateHabitInput = z.infer<typeof createHabitSchema>
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>
export type GetHabitsQuery = z.infer<typeof getHabitsQuerySchema>
export type HabitIdParam = z.infer<typeof habitIdParamSchema>

export type HabitEntryDto = {
  id: string
  date: string
  waterIntakeMl: number
  exerciseMinutes: number
  sleepHours: number
  createdAt: string
  updatedAt: string
}
