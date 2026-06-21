import type { FastifyInstance } from 'fastify'
import { prisma } from '../../prisma/client'
import { authenticate } from '../../common/middleware/authenticate'
import { UsersRepository } from './repository'
import { UsersService } from './service'
import { UsersController } from './controller'

export async function usersRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new UsersRepository(prisma)
  const service = new UsersService(repo)
  const controller = new UsersController(service)

  const preHandler = [authenticate]

  fastify.get('/me', { preHandler }, (req, reply) => controller.getMe(req, reply))
  fastify.patch('/me', { preHandler }, (req, reply) => controller.updateMe(req, reply))
  fastify.patch('/me/password', { preHandler }, (req, reply) => controller.changePassword(req, reply))
}
