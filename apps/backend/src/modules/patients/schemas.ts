import { z } from 'zod'

export const patientIdParamSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
})

export const patientHabitsQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
})

export const searchPatientsQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100),
})
