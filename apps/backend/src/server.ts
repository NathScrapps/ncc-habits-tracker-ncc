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

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function resolveCorsOrigin(): string | string[] {
  const raw = process.env['CORS_ORIGIN']?.trim()
  if (!raw) return '*'

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (origins.length <= 1) return origins[0] ?? '*'
  return origins
}

export async function buildServer() {
  getRequiredEnv('DATABASE_URL')
  const jwtSecret = getRequiredEnv('JWT_SECRET')

  const app = Fastify({
    logger: { level: process.env['LOG_LEVEL'] ?? 'info' },
  })

  await app.register(cors, {
    origin: resolveCorsOrigin(),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  await app.register(fjwt, { secret: jwtSecret })

  app.get('/health', async () => ({ status: 'ok' }))

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
