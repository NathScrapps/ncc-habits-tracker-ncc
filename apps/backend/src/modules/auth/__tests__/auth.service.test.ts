import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'
import { AuthService } from '../service'
import { ConflictError, UnauthorizedError } from '../../../common/errors/AppError'
import * as jwtUtils from '../../../common/utils/jwt'
import * as hashUtils from '../../../common/utils/hash'
import type { AuthRepository } from '../repository'

vi.mock('../../../common/utils/jwt', () => ({
  signAccessToken: vi.fn().mockReturnValue('mock-access-token'),
  signRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
  verifyRefreshToken: vi.fn(),
}))

vi.mock('../../../common/utils/hash', () => ({
  hashToken: vi.fn().mockReturnValue('mock-hash'),
  compareToken: vi.fn(),
}))

function makeMockRepo() {
  return {
    findUserByEmail: vi.fn(),
    findUserById: vi.fn(),
    createUserWithPatientProfile: vi.fn(),
    saveRefreshToken: vi.fn(),
    findRefreshTokensByUserId: vi.fn(),
    deleteRefreshToken: vi.fn(),
    deleteAllRefreshTokensByUserId: vi.fn(),
  }
}

describe('AuthService', () => {
  let service: AuthService
  let repo: ReturnType<typeof makeMockRepo>

  beforeEach(() => {
    vi.clearAllMocks()
    repo = makeMockRepo()
    service = new AuthService(repo as unknown as AuthRepository)
  })

  // ---------------------------------------------------------------------------
  // register
  // ---------------------------------------------------------------------------
  describe('register', () => {
    it('returns success message when email is not taken', async () => {
      repo.findUserByEmail.mockResolvedValue(null)
      repo.createUserWithPatientProfile.mockResolvedValue({})

      const result = await service.register({
        email: 'alice@test.com',
        password: 'Password1',
        fullName: 'Alice',
      })

      expect(result).toEqual({ message: 'Patient registered successfully' })
      expect(repo.createUserWithPatientProfile).toHaveBeenCalledOnce()
    })

    it('throws ConflictError when email is already registered', async () => {
      repo.findUserByEmail.mockResolvedValue({ id: '1', email: 'alice@test.com' })

      await expect(
        service.register({ email: 'alice@test.com', password: 'Password1', fullName: 'Alice' }),
      ).rejects.toBeInstanceOf(ConflictError)
    })

    it('never stores the plain-text password', async () => {
      repo.findUserByEmail.mockResolvedValue(null)
      repo.createUserWithPatientProfile.mockResolvedValue({})

      await service.register({ email: 'alice@test.com', password: 'Password1', fullName: 'Alice' })

      const { passwordHash } = repo.createUserWithPatientProfile.mock.calls[0]![0]
      expect(passwordHash).not.toBe('Password1')
      expect(await bcrypt.compare('Password1', passwordHash)).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------
  describe('login', () => {
    const passwordHash = bcrypt.hashSync('Password1', 1)
    const fakeUser = { id: 'user-1', email: 'alice@test.com', passwordHash, role: 'PATIENT' }

    it('returns tokens and user info for valid credentials', async () => {
      repo.findUserByEmail.mockResolvedValue(fakeUser)
      repo.saveRefreshToken.mockResolvedValue(undefined)

      const result = await service.login({ email: 'alice@test.com', password: 'Password1' })

      expect(result).toMatchObject({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 'user-1', role: 'PATIENT' },
      })
      expect(repo.saveRefreshToken).toHaveBeenCalledOnce()
    })

    it('throws UnauthorizedError when email does not exist', async () => {
      repo.findUserByEmail.mockResolvedValue(null)

      await expect(
        service.login({ email: 'no@test.com', password: 'Password1' }),
      ).rejects.toBeInstanceOf(UnauthorizedError)
    })

    it('throws UnauthorizedError for wrong password', async () => {
      repo.findUserByEmail.mockResolvedValue(fakeUser)

      await expect(
        service.login({ email: 'alice@test.com', password: 'WrongPass' }),
      ).rejects.toBeInstanceOf(UnauthorizedError)
    })

    it('returns the same error message for wrong email and wrong password (prevents user enumeration)', async () => {
      repo.findUserByEmail.mockResolvedValue(null)
      const err1 = await service
        .login({ email: 'no@test.com', password: 'pass' })
        .catch((e: Error) => e)

      repo.findUserByEmail.mockResolvedValue(fakeUser)
      const err2 = await service
        .login({ email: 'alice@test.com', password: 'wrong' })
        .catch((e: Error) => e)

      expect((err1 as Error).message).toBe((err2 as Error).message)
    })

    it('stores the refresh token hash, not the raw token', async () => {
      repo.findUserByEmail.mockResolvedValue(fakeUser)
      repo.saveRefreshToken.mockResolvedValue(undefined)
      vi.mocked(hashUtils.hashToken).mockReturnValue('hashed-refresh-token')

      await service.login({ email: 'alice@test.com', password: 'Password1' })

      const { tokenHash } = repo.saveRefreshToken.mock.calls[0]![0]
      expect(tokenHash).toBe('hashed-refresh-token')
      expect(tokenHash).not.toBe('mock-refresh-token')
    })
  })

  // ---------------------------------------------------------------------------
  // refresh
  // ---------------------------------------------------------------------------
  describe('refresh', () => {
    it('returns a new access token for a valid, non-revoked refresh token', async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue({ sub: 'user-1' })
      vi.mocked(hashUtils.hashToken).mockReturnValue('stored-hash')
      repo.findRefreshTokensByUserId.mockResolvedValue([
        { id: 'tok-1', tokenHash: 'stored-hash', expiresAt: new Date(Date.now() + 10_000) },
      ])
      repo.findUserById.mockResolvedValue({ id: 'user-1', role: 'PATIENT' })

      const result = await service.refresh({ refreshToken: 'valid-token' })

      expect(result).toEqual({ accessToken: 'mock-access-token' })
    })

    it('throws UnauthorizedError when the JWT signature is invalid', async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockImplementation(() => {
        throw new Error('jwt malformed')
      })

      await expect(service.refresh({ refreshToken: 'bad-token' })).rejects.toBeInstanceOf(
        UnauthorizedError,
      )
    })

    it('throws UnauthorizedError when the token is not found in the database (revoked)', async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue({ sub: 'user-1' })
      vi.mocked(hashUtils.hashToken).mockReturnValue('different-hash')
      repo.findRefreshTokensByUserId.mockResolvedValue([
        { id: 'tok-1', tokenHash: 'stored-hash', expiresAt: new Date(Date.now() + 10_000) },
      ])

      await expect(service.refresh({ refreshToken: 'revoked-token' })).rejects.toBeInstanceOf(
        UnauthorizedError,
      )
    })

    it('throws UnauthorizedError when the DB record has already expired', async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue({ sub: 'user-1' })
      vi.mocked(hashUtils.hashToken).mockReturnValue('stored-hash')
      repo.findRefreshTokensByUserId.mockResolvedValue([
        { id: 'tok-1', tokenHash: 'stored-hash', expiresAt: new Date(Date.now() - 1_000) },
      ])

      await expect(service.refresh({ refreshToken: 'expired-db-token' })).rejects.toBeInstanceOf(
        UnauthorizedError,
      )
    })
  })

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------
  describe('logout', () => {
    it('deletes the refresh token on a valid logout', async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue({ sub: 'user-1' })
      vi.mocked(hashUtils.hashToken).mockReturnValue('stored-hash')
      repo.findRefreshTokensByUserId.mockResolvedValue([
        { id: 'tok-1', tokenHash: 'stored-hash', expiresAt: new Date(Date.now() + 10_000) },
      ])
      repo.deleteRefreshToken.mockResolvedValue(undefined)

      await service.logout({ refreshToken: 'valid-token' })

      expect(repo.deleteRefreshToken).toHaveBeenCalledWith('tok-1')
    })

    it('resolves silently when the JWT is invalid (idempotent)', async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockImplementation(() => {
        throw new Error('jwt expired')
      })

      await expect(service.logout({ refreshToken: 'expired-token' })).resolves.toBeUndefined()
      expect(repo.deleteRefreshToken).not.toHaveBeenCalled()
    })

    it('resolves silently when the token is not found in the database', async () => {
      vi.mocked(jwtUtils.verifyRefreshToken).mockReturnValue({ sub: 'user-1' })
      vi.mocked(hashUtils.hashToken).mockReturnValue('no-match-hash')
      repo.findRefreshTokensByUserId.mockResolvedValue([
        { id: 'tok-1', tokenHash: 'stored-hash', expiresAt: new Date(Date.now() + 10_000) },
      ])

      await expect(service.logout({ refreshToken: 'unknown-token' })).resolves.toBeUndefined()
      expect(repo.deleteRefreshToken).not.toHaveBeenCalled()
    })
  })
})
