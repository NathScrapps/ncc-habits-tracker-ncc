import { z } from 'zod'

export const createUserSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['PATIENT', 'NUTRITIONIST', 'ADMIN']),
    fullName: z.string().min(1, 'Full name is required').max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== 'ADMIN' && !data.fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Full name is required for PATIENT and NUTRITIONIST',
        path: ['fullName'],
      })
    }
  })

export type CreateUserFormValues = z.infer<typeof createUserSchema>
