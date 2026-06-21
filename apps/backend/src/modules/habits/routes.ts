import type { FastifyInstance } from 'fastify'
import { Role } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { authenticate } from '../../common/middleware/authenticate'
import { requireRole } from '../../common/middleware/require-role'
import { HabitsRepository } from './repository'
import { HabitsService } from './service'
import { HabitsController } from './controller'

export async function habitsRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new HabitsRepository(prisma)
  const service = new HabitsService(repo)
  const controller = new HabitsController(service)

  const preHandler = [authenticate, requireRole(Role.PATIENT)]

  fastify.post('/', { preHandler }, (req, reply) => controller.create(req, reply))
  fastify.patch('/:id', { preHandler }, (req, reply) => controller.update(req, reply))
  fastify.get('/', { preHandler }, (req, reply) => controller.getHistory(req, reply))
  fastify.get('/:id', { preHandler }, (req, reply) => controller.getById(req, reply))
}
