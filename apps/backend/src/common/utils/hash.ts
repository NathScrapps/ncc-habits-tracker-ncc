import crypto from 'crypto'

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function compareToken(raw: string, hashed: string): boolean {
  return hashToken(raw) === hashed
}
