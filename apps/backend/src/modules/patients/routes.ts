import type { FastifyInstance } from 'fastify'
import { Role } from '@prisma/client'
import { prisma } from '../../prisma/client'
import { authenticate } from '../../common/middleware/authenticate'
import { requireRole } from '../../common/middleware/require-role'
import { PatientsRepository } from './repository'
import { PatientsService } from './service'
import { PatientsController } from './controller'

export async function patientsRoutes(fastify: FastifyInstance): Promise<void> {
  const repo = new PatientsRepository(prisma)
  const service = new PatientsService(repo)
  const controller = new PatientsController(service)

  const preHandler = [authenticate, requireRole(Role.NUTRITIONIST)]

  fastify.get('/patients/search', { preHandler }, (req, reply) =>
    controller.searchPatients(req, reply),
  )
  fastify.get('/patients', { preHandler }, (req, reply) => controller.listPatients(req, reply))
  fastify.get('/patients/:patientId', { preHandler }, (req, reply) =>
    controller.getPatient(req, reply),
  )
  fastify.get('/patients/:patientId/habits', { preHandler }, (req, reply) =>
    controller.getPatientHabits(req, reply),
  )
}
