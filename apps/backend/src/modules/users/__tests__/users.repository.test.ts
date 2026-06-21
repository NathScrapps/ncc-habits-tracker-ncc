import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UsersRepository } from '../repository'

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  patientProfile: {
    update: vi.fn(),
  },
  nutritionistProfile: {
    update: vi.fn(),
  },
  refreshToken: {
    deleteMany: vi.fn(),
  },
}

describe('UsersRepository', () => {
  let repo: UsersRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new UsersRepository(mockPrisma as any)
  })

  describe('findUserWithProfile', () => {
    it('queries with patientProfile and nutritionistProfile selects', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        patientProfile: { fullName: 'Alice' },
        nutritionistProfile: null,
      })

      const result = await repo.findUserWithProfile('user-1')

      expect(result).toMatchObject({ id: 'user-1' })
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          patientProfile: { select: { fullName: true } },
          nutritionistProfile: { select: { fullName: true } },
        },
      })
    })

    it('returns null when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      expect(await repo.findUserWithProfile('unknown')).toBeNull()
    })
  })

  describe('updatePatientFullName', () => {
    it('updates the patient profile for the given userId', async () => {
      mockPrisma.patientProfile.update.mockResolvedValue(undefined)

      await repo.updatePatientFullName('user-1', 'New Name')

      expect(mockPrisma.patientProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: { fullName: 'New Name' },
      })
    })
  })

  describe('updateUserPassword', () => {
    it('updates the passwordHash on the user record', async () => {
      mockPrisma.user.update.mockResolvedValue(undefined)

      await repo.updateUserPassword('user-1', 'new-hash-value')

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { passwordHash: 'new-hash-value' },
      })
    })
  })

  describe('deleteAllRefreshTokensByUserId', () => {
    it('deletes all refresh tokens for the given user', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 })

      await repo.deleteAllRefreshTokensByUserId('user-1')

      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
    })
  })
})
