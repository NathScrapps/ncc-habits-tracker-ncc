import type { Role } from '@prisma/client'
import type { z } from 'zod'
import type { registerSchema, loginSchema, refreshSchema } from './schemas'

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>

export type LoginResponse = {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; role: Role }
}

export type RefreshResponse = {
  accessToken: string
}
