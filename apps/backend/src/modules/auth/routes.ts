import type { FastifyInstance } from 'fastify'
import { prisma } from '../../prisma/client'
import { AuthRepository } from './repository'
import { AuthService } from './service'
import { AuthController } from './controller'

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new AuthRepository(prisma)
  const service = new AuthService(repo)
  const controller = new AuthController(service)

  fastify.post('/register', (req, reply) => controller.register(req, reply))
  fastify.post('/login', (req, reply) => controller.login(req, reply))
  fastify.post('/refresh', (req, reply) => controller.refresh(req, reply))
  fastify.post('/logout', (req, reply) => controller.logout(req, reply))
}
