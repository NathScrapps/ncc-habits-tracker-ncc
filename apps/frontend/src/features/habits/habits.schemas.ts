import { z } from 'zod'

export const habitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  waterIntakeMl: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
  exerciseMinutes: z.coerce.number().int('Must be a whole number').min(0, 'Must be 0 or more'),
  sleepHours: z.coerce
    .number()
    .min(0, 'Must be 0 or more')
    .max(24, 'Must be 24 or less'),
})

export type HabitFormValues = z.infer<typeof habitSchema>
