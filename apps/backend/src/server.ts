import 'dotenv/config'
import Fastify from 'fastify'
import fjwt from '@fastify/jwt'
import cors from '@fastify/cors'
import { errorHandler } from './common/plugins/error-handler.plugin'
import { swaggerPlugin } from './common/plugins/swagger.plugin'
import { authRoutes } from './modules/auth/routes'
import { habitsRoutes } from './modules/habits/routes'
import { patientsRoutes } from './modules/patients/routes'
import { usersRoutes } from './modules/users/routes'
import { nutritionistsRoutes } from './modules/nutritionists/routes'
import { adminRoutes } from './modules/admin/routes'

export async function buildServer() {
  const app = Fastify({
    logger: { level: process.env['LOG_LEVEL'] ?? 'info' },
  })

  await app.register(cors, { origin: process.env['CORS_ORIGIN'] ?? '*' })

  await app.register(fjwt, { secret: process.env['JWT_SECRET']! })

  if (process.env['NODE_ENV'] !== 'production') {
    await app.register(swaggerPlugin)
  }

  app.setErrorHandler(errorHandler)

  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(usersRoutes, { prefix: '/api/v1/users' })
  await app.register(habitsRoutes, { prefix: '/api/v1/habits' })
  await app.register(patientsRoutes, { prefix: '/api/v1/nutritionist' })
  await app.register(nutritionistsRoutes, { prefix: '/api/v1/nutritionists' })
  await app.register(adminRoutes, { prefix: '/api/v1/admin' })

  return app
}

async function start(): Promise<void> {
  const app = await buildServer()
  try {
    await app.listen({ port: Number(process.env['PORT']) || 4000, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
