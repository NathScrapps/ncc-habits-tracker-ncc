import type { FastifyRequest, FastifyReply } from 'fastify'
import type { Role } from '@prisma/client'
import { ForbiddenError } from '../errors/AppError'

export function requireRole(...roles: Role[]) {
  return async (req: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions')
    }
  }
}
