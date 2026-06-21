import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Role } from '@prisma/client'
import { AuthRepository } from '../repository'

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  refreshToken: {
    create: vi.fn(),
    findMany: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
}

describe('AuthRepository', () => {
  let repo: AuthRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new AuthRepository(mockPrisma as any)
  })

  // ---------------------------------------------------------------------------
  // findUserByEmail
  // ---------------------------------------------------------------------------
  describe('findUserByEmail', () => {
    it('queries by email and returns the user', async () => {
      const fakeUser = { id: 'u-1', email: 'alice@test.com' }
      mockPrisma.user.findUnique.mockResolvedValue(fakeUser)

      const result = await repo.findUserByEmail('alice@test.com')

      expect(result).toEqual(fakeUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'alice@test.com' },
      })
    })

    it('returns null when the user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      expect(await repo.findUserByEmail('no@test.com')).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // findUserById
  // ---------------------------------------------------------------------------
  describe('findUserById', () => {
    it('queries by id and returns the user', async () => {
      const fakeUser = { id: 'u-1', email: 'alice@test.com' }
      mockPrisma.user.findUnique.mockResolvedValue(fakeUser)

      const result = await repo.findUserById('u-1')

      expect(result).toEqual(fakeUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'u-1' } })
    })
  })

  // ---------------------------------------------------------------------------
  // createUserWithPatientProfile
  // ---------------------------------------------------------------------------
  describe('createUserWithPatientProfile', () => {
    it('creates a user with role PATIENT and a nested patient profile', async () => {
      const fakeUser = { id: 'u-1', email: 'alice@test.com', role: Role.PATIENT }
      mockPrisma.user.create.mockResolvedValue(fakeUser)

      const result = await repo.createUserWithPatientProfile({
        email: 'alice@test.com',
        passwordHash: 'hashed',
        fullName: 'Alice',
      })

      expect(result).toEqual(fakeUser)
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'alice@test.com',
          role: Role.PATIENT,
          patientProfile: { create: { fullName: 'Alice' } },
        }),
      })
    })
  })

  // ---------------------------------------------------------------------------
  // saveRefreshToken
  // ---------------------------------------------------------------------------
  describe('saveRefreshToken', () => {
    it('persists the token data', async () => {
      mockPrisma.refreshToken.create.mockResolvedValue({})
      const expiresAt = new Date()

      await repo.saveRefreshToken({ userId: 'u-1', tokenHash: 'h', expiresAt })

      expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
        data: { userId: 'u-1', tokenHash: 'h', expiresAt },
      })
    })
  })

  // ---------------------------------------------------------------------------
  // findRefreshTokensByUserId
  // ---------------------------------------------------------------------------
  describe('findRefreshTokensByUserId', () => {
    it('returns all tokens for the given user', async () => {
      const tokens = [{ id: 'tok-1', tokenHash: 'h', userId: 'u-1' }]
      mockPrisma.refreshToken.findMany.mockResolvedValue(tokens)

      const result = await repo.findRefreshTokensByUserId('u-1')

      expect(result).toEqual(tokens)
      expect(mockPrisma.refreshToken.findMany).toHaveBeenCalledWith({ where: { userId: 'u-1' } })
    })
  })

  // ---------------------------------------------------------------------------
  // deleteRefreshToken
  // ---------------------------------------------------------------------------
  describe('deleteRefreshToken', () => {
    it('deletes the token by id', async () => {
      mockPrisma.refreshToken.delete.mockResolvedValue({})

      await repo.deleteRefreshToken('tok-1')

      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({ where: { id: 'tok-1' } })
    })
  })

  // ---------------------------------------------------------------------------
  // deleteAllRefreshTokensByUserId
  // ---------------------------------------------------------------------------
  describe('deleteAllRefreshTokensByUserId', () => {
    it('bulk-deletes all tokens for the user', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 3 })

      await repo.deleteAllRefreshTokensByUserId('u-1')

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { userId: 'u-1' } })
    })
  })
})
