import type { FastifyInstance } from 'fastify'
import { Role } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { authenticate } from '../../common/middleware/authenticate'
import { requireRole } from '../../common/middleware/require-role'
import { NutritionistsRepository } from './repository'
import { NutritionistsService } from './service'
import { NutritionistsController } from './controller'

export async function nutritionistsRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new NutritionistsRepository(prisma)
  const service = new NutritionistsService(repo)
  const controller = new NutritionistsController(service)

  const preHandler = [authenticate, requireRole(Role.NUTRITIONIST)]

  fastify.post('/patients/:patientId', { preHandler }, (req, reply) =>
    controller.assignPatient(req, reply),
  )

  fastify.delete('/patients/:patientId', { preHandler }, (req, reply) =>
    controller.unassignPatient(req, reply),
  )
}
