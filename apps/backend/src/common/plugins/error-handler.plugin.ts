import type { FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'
import { AppError } from '../errors/AppError'

export function errorHandler(error: Error, req: FastifyRequest, reply: FastifyReply): void {
  if (error instanceof ZodError) {
    reply.status(422).send({
      message: 'Validation failed',
      errors: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      message: error.message,
      errors: error.errors,
    })
    return
  }

  req.log.error(error)
  reply.status(500).send({
    message: 'Internal server error',
    errors: [],
  })
}
