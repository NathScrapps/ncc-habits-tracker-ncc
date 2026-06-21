import type { FastifyRequest, FastifyReply } from 'fastify'
import type { HabitsService } from './service'
import { createHabitSchema, getHabitsQuerySchema, habitIdParamSchema, updateHabitSchema } from './schemas'

export class HabitsController {
  constructor(private readonly service: HabitsService) {}

  async create(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = createHabitSchema.parse(req.body)
    const result = await this.service.create(req.user.sub, body)
    reply.status(201).send(result)
  }

  async update(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = habitIdParamSchema.parse(req.params)
    const body = updateHabitSchema.parse(req.body)
    const result = await this.service.update(req.user.sub, id, body)
    reply.status(200).send(result)
  }

  async getHistory(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = getHabitsQuerySchema.parse(req.query)
    const result = await this.service.getHistory(req.user.sub, query)
    reply.status(200).send(result)
  }

  async getById(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = habitIdParamSchema.parse(req.params)
    const result = await this.service.getById(req.user.sub, id)
    reply.status(200).send(result)
  }
}
