import type { FastifyRequest, FastifyReply } from 'fastify'
import { updateMeSchema, changePasswordSchema } from './schemas'
import type { UsersService } from './service'

export class UsersController {
  constructor(private readonly service: UsersService) {}

  async getMe(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const dto = await this.service.getMe(req.user.sub)
    reply.status(200).send(dto)
  }

  async updateMe(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = updateMeSchema.parse(req.body)
    const dto = await this.service.updateMe(req.user.sub, req.user.role, body)
    reply.status(200).send(dto)
  }

  async changePassword(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = changePasswordSchema.parse(req.body)
    await this.service.changePassword(req.user.sub, body)
    reply.status(204).send()
  }
}
