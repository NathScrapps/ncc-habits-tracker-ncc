import { z } from 'zod'
import { Role } from '@prisma/client'

export const createUserSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.nativeEnum(Role),
    fullName: z.string().min(1, 'Full name is required').max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== Role.ADMIN && !data.fullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Full name is required for PATIENT and NUTRITIONIST roles',
        path: ['fullName'],
      })
    }
  })

export const listUsersQuerySchema = z.object({
  role: z.nativeEnum(Role).optional(),
})
