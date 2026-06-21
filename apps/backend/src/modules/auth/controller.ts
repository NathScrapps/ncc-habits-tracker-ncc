import type { FastifyRequest, FastifyReply } from 'fastify'
import type { AuthService } from './service'
import { registerSchema, loginSchema, refreshSchema } from './schemas'

export class AuthController {
  constructor(private readonly service: AuthService) {}

  async register(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = registerSchema.parse(req.body)
    const result = await this.service.register(body)
    reply.status(201).send(result)
  }

  async login(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = loginSchema.parse(req.body)
    const result = await this.service.login(body)
    reply.status(200).send(result)
  }

  async refresh(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = refreshSchema.parse(req.body)
    const result = await this.service.refresh(body)
    reply.status(200).send(result)
  }

  async logout(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const body = refreshSchema.parse(req.body)
    await this.service.logout(body)
    reply.status(204).send()
  }
}
