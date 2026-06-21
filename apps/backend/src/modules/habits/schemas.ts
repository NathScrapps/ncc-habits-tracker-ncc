import { z } from 'zod'

const datePattern = /^\d{4}-\d{2}-\d{2}$/

export const createHabitSchema = z.object({
  date: z.string().regex(datePattern, 'Date must be in YYYY-MM-DD format'),
  waterIntakeMl: z.number().int().min(0),
  exerciseMinutes: z.number().int().min(0),
  sleepHours: z.number().min(0).max(24),
})

export const updateHabitSchema = z.object({
  waterIntakeMl: z.number().int().min(0).optional(),
  exerciseMinutes: z.number().int().min(0).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
})

export const getHabitsQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
  from: z.string().regex(datePattern, 'from must be YYYY-MM-DD').optional(),
  to: z.string().regex(datePattern, 'to must be YYYY-MM-DD').optional(),
})

export const habitIdParamSchema = z.object({
  id: z.string().uuid('Invalid habit ID'),
})
