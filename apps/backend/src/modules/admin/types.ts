import type { Role } from '@prisma/client'
import type { z } from 'zod'
import type { createUserSchema, listUsersQuerySchema } from './schemas'

export type CreateUserInput = z.infer<typeof createUserSchema>
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

export interface AdminUserDto {
  id: string
  email: string
  role: Role
  fullName: string | null
  createdAt: string
}
