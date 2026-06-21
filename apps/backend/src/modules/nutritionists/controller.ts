import type { FastifyRequest, FastifyReply } from 'fastify'
import { patientIdParamSchema } from './schemas'
import type { NutritionistsService } from './service'

export class NutritionistsController {
  constructor(private readonly service: NutritionistsService) {}

  async assignPatient(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { patientId } = patientIdParamSchema.parse(req.params)
    const dto = await this.service.assignPatient(req.user.sub, patientId)
    reply.status(200).send(dto)
  }

  async unassignPatient(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { patientId } = patientIdParamSchema.parse(req.params)
    await this.service.unassignPatient(req.user.sub, patientId)
    reply.status(204).send()
  }
}
