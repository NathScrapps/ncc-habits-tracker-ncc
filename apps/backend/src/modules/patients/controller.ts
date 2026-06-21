import type { FastifyRequest, FastifyReply } from 'fastify'
import type { PatientsService } from './service'
import { patientIdParamSchema, patientHabitsQuerySchema, searchPatientsQuerySchema } from './schemas'

export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  async searchPatients(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { q } = searchPatientsQuerySchema.parse(req.query)
    const result = await this.service.searchPatients(req.user.sub, q)
    reply.status(200).send(result)
  }

  async listPatients(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.service.listPatients(req.user.sub)
    reply.status(200).send(result)
  }

  async getPatient(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { patientId } = patientIdParamSchema.parse(req.params)
    const result = await this.service.getPatient(req.user.sub, patientId)
    reply.status(200).send(result)
  }

  async getPatientHabits(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { patientId } = patientIdParamSchema.parse(req.params)
    const query = patientHabitsQuerySchema.parse(req.query)
    const result = await this.service.getPatientHabits(req.user.sub, patientId, query)
    reply.status(200).send(result)
  }
}
