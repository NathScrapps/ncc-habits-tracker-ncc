import bcrypt from 'bcrypt'
import { ConflictError, UnauthorizedError } from '../../common/errors/AppError'
import { hashToken } from '../../common/utils/hash'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../common/utils/jwt'
import type { AuthRepository } from './repository'
import type { RegisterInput, LoginInput, RefreshInput, LoginResponse, RefreshResponse } from './types'

const BCRYPT_ROUNDS = 12
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async register(input: RegisterInput): Promise<{ message: string }> {
    const existing = await this.repo.findUserByEmail(input.email)
    if (existing) throw new ConflictError('Email already in use')

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
    await this.repo.createUserWithPatientProfile({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
    })

    return { message: 'Patient registered successfully' }
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await this.repo.findUserByEmail(input.email)
    if (!user) throw new UnauthorizedError('Invalid credentials')

    const valid = await bcrypt.compare(input.password, user.passwordHash)
    if (!valid) throw new UnauthorizedError('Invalid credentials')

    const accessToken = signAccessToken({ sub: user.id, role: user.role })
    const rawRefreshToken = signRefreshToken({ sub: user.id })
    const tokenHash = hashToken(rawRefreshToken)
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS)

    await this.repo.saveRefreshToken({ userId: user.id, tokenHash, expiresAt })

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    }
  }

  async refresh(input: RefreshInput): Promise<RefreshResponse> {
    let payload: { sub: string }
    try {
      payload = verifyRefreshToken(input.refreshToken)
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    const tokens = await this.repo.findRefreshTokensByUserId(payload.sub)
    const tokenHash = hashToken(input.refreshToken)
    const stored = tokens.find(
      (t) => t.tokenHash === tokenHash && t.expiresAt > new Date(),
    )

    if (!stored) throw new UnauthorizedError('Refresh token revoked or expired')

    const user = await this.repo.findUserById(payload.sub)
    if (!user) throw new UnauthorizedError('User not found')

    return { accessToken: signAccessToken({ sub: user.id, role: user.role }) }
  }

  async logout(input: RefreshInput): Promise<void> {
    let payload: { sub: string }
    try {
      payload = verifyRefreshToken(input.refreshToken)
    } catch {
      return
    }

    const tokens = await this.repo.findRefreshTokensByUserId(payload.sub)
    const tokenHash = hashToken(input.refreshToken)
    const stored = tokens.find((t) => t.tokenHash === tokenHash)

    if (stored) {
      await this.repo.deleteRefreshToken(stored.id)
    }
  }
}
