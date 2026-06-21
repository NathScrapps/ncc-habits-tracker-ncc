import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AdminService } from './service'
import { createUserSchema, listUsersQuerySchema } from './schemas'

export class AdminController {
  constructor(private readonly service: AdminService) {}

  async createUser(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = createUserSchema.parse(req.body)
    const result = await this.service.createUser(body)
    reply.status(201).send(result)
  }

  async listUsers(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const query = listUsersQuerySchema.parse(req.query)
    const result = await this.service.listUsers(query)
    reply.status(200).send(result)
  }
}
