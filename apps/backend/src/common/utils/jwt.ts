import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import type { Role } from '@prisma/client'

export type AccessPayload = {
  sub: string
  role: Role
}

export type RefreshPayload = {
  sub: string
}

function getJwtSecret(): string {
  const secret = process.env['JWT_SECRET']?.trim()
  if (!secret) {
    throw new Error('Missing JWT secret: set JWT_SECRET')
  }
  return secret
}

function getRefreshSecret(): string {
  const secret = process.env['REFRESH_TOKEN_SECRET']?.trim() ?? process.env['REFRESH_SECRET']?.trim()
  if (!secret) {
    throw new Error('Missing refresh token secret: set REFRESH_TOKEN_SECRET or REFRESH_SECRET')
  }
  return secret
}

function getAccessTokenExpiry(): SignOptions['expiresIn'] {
  return (process.env['ACCESS_TOKEN_EXPIRY'] ?? '15m') as SignOptions['expiresIn']
}

function getRefreshTokenExpiry(): SignOptions['expiresIn'] {
  return (process.env['REFRESH_TOKEN_EXPIRY'] ?? '7d') as SignOptions['expiresIn']
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, process.env['JWT_SECRET']!, {
    expiresIn: getAccessTokenExpiry(),
  })
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: getRefreshTokenExpiry(),
  })
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, process.env['JWT_SECRET']!) as AccessPayload
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, getRefreshSecret()) as RefreshPayload
}
