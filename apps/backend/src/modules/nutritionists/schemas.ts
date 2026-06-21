import { z } from 'zod'

export const patientIdParamSchema = z.object({
  patientId: z.string().uuid('Patient ID must be a valid UUID'),
})
