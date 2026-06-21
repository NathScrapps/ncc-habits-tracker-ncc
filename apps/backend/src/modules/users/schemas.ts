import { z } from 'zod'

export const updateMeSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})
