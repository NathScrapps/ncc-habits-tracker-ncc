import type { FastifyInstance } from 'fastify'
import { Role } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { authenticate } from '../../common/middleware/authenticate'
import { requireRole } from '../../common/middleware/require-role'
import { AdminRepository } from './repository'
import { AdminService } from './service'
import { AdminController } from './controller'

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new AdminRepository(prisma)
  const service = new AdminService(repo)
  const controller = new AdminController(service)

  const preHandler = [authenticate, requireRole(Role.ADMIN)]

  fastify.post('/users', { preHandler }, (req, reply) => controller.createUser(req, reply))
  fastify.get('/users', { preHandler }, (req, reply) => controller.listUsers(req, reply))
}
