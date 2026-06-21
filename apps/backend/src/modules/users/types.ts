import type { Role } from '@prisma/client'
import type { z } from 'zod'
import type { updateMeSchema, changePasswordSchema } from './schemas'

export type UpdateMeInput = z.infer<typeof updateMeSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export interface UserProfileDto {
  id: string
  email: string
  role: Role
  fullName: string
  createdAt: string
}
