import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcrypt'
import { UsersService } from '../service'
import { BadRequestError, NotFoundError } from '../../../common/errors/AppError'
import { Role } from '@prisma/client'
import type { UsersRepository } from '../repository'

function makeMockRepo() {
  return {
    findUserWithProfile: vi.fn(),
    findUserById: vi.fn(),
    updatePatientFullName: vi.fn(),
    updateNutritionistFullName: vi.fn(),
    updateUserPassword: vi.fn(),
    deleteAllRefreshTokensByUserId: vi.fn(),
  }
}

const baseUser = {
  passwordHash: 'irrelevant',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

const mockPatient = {
  ...baseUser,
  id: 'user-1',
  email: 'alice@example.com',
  role: Role.PATIENT,
  patientProfile: { fullName: 'Alice Smith' },
  nutritionistProfile: null,
}

const mockNutritionist = {
  ...baseUser,
  id: 'user-2',
  email: 'doc@example.com',
  role: Role.NUTRITIONIST,
  patientProfile: null,
  nutritionistProfile: { fullName: 'Dr. García' },
}

describe('UsersService', () => {
  let service: UsersService
  let repo: ReturnType<typeof makeMockRepo>

  beforeEach(() => {
    vi.clearAllMocks()
    repo = makeMockRepo()
    service = new UsersService(repo as unknown as UsersRepository)
  })

  // ---------------------------------------------------------------------------
  // getMe
  // ---------------------------------------------------------------------------
  describe('getMe', () => {
    it('returns a full DTO for a patient, pulling fullName from patientProfile', async () => {
      repo.findUserWithProfile.mockResolvedValue(mockPatient)

      const result = await service.getMe('user-1')

      expect(result).toEqual({
        id: 'user-1',
        email: 'alice@example.com',
        role: Role.PATIENT,
        fullName: 'Alice Smith',
        createdAt: '2026-01-01T00:00:00.000Z',
      })
    })

    it('returns a full DTO for a nutritionist, pulling fullName from nutritionistProfile', async () => {
      repo.findUserWithProfile.mockResolvedValue(mockNutritionist)

      const result = await service.getMe('user-2')

      expect(result.fullName).toBe('Dr. García')
      expect(result.role).toBe(Role.NUTRITIONIST)
      expect(result.email).toBe('doc@example.com')
    })

    it('throws NotFoundError when the user does not exist', async () => {
      repo.findUserWithProfile.mockResolvedValue(null)

      await expect(service.getMe('unknown-id')).rejects.toBeInstanceOf(NotFoundError)
    })
  })

  // ---------------------------------------------------------------------------
  // updateMe
  // ---------------------------------------------------------------------------
  describe('updateMe', () => {
    it('updates patientProfile fullName and returns the refreshed DTO', async () => {
      repo.updatePatientFullName.mockResolvedValue(undefined)
      repo.findUserWithProfile.mockResolvedValue({
        ...mockPatient,
        patientProfile: { fullName: 'Alice Updated' },
      })

      const result = await service.updateMe('user-1', Role.PATIENT, { fullName: 'Alice Updated' })

      expect(repo.updatePatientFullName).toHaveBeenCalledWith('user-1', 'Alice Updated')
      expect(repo.updateNutritionistFullName).not.toHaveBeenCalled()
      expect(result.fullName).toBe('Alice Updated')
    })

    it('updates nutritionistProfile fullName when role is NUTRITIONIST', async () => {
      repo.updateNutritionistFullName.mockResolvedValue(undefined)
      repo.findUserWithProfile.mockResolvedValue({
        ...mockNutritionist,
        nutritionistProfile: { fullName: 'Dr. Updated' },
      })

      const result = await service.updateMe('user-2', Role.NUTRITIONIST, { fullName: 'Dr. Updated' })

      expect(repo.updateNutritionistFullName).toHaveBeenCalledWith('user-2', 'Dr. Updated')
      expect(repo.updatePatientFullName).not.toHaveBeenCalled()
      expect(result.fullName).toBe('Dr. Updated')
    })
  })

  // ---------------------------------------------------------------------------
  // changePassword
  // ---------------------------------------------------------------------------
  describe('changePassword', () => {
    // Use 1 round so test-time hashing is fast
    const passwordHash = bcrypt.hashSync('OldPass1', 1)
    const fakeUser = { id: 'user-1', passwordHash }

    it('throws NotFoundError when the user does not exist', async () => {
      repo.findUserById.mockResolvedValue(null)

      await expect(
        service.changePassword('unknown', { currentPassword: 'any', newPassword: 'NewPass123' }),
      ).rejects.toBeInstanceOf(NotFoundError)
    })

    it('throws BadRequestError and does not update password when current password is wrong', async () => {
      repo.findUserById.mockResolvedValue(fakeUser)

      await expect(
        service.changePassword('user-1', { currentPassword: 'WrongPass', newPassword: 'NewPass123' }),
      ).rejects.toBeInstanceOf(BadRequestError)

      expect(repo.updateUserPassword).not.toHaveBeenCalled()
      expect(repo.deleteAllRefreshTokensByUserId).not.toHaveBeenCalled()
    })

    it('hashes the new password before storing it — never stores plain text', async () => {
      repo.findUserById.mockResolvedValue(fakeUser)
      repo.updateUserPassword.mockResolvedValue(undefined)
      repo.deleteAllRefreshTokensByUserId.mockResolvedValue(undefined)

      await service.changePassword('user-1', { currentPassword: 'OldPass1', newPassword: 'NewPass123' })

      const [, storedHash] = repo.updateUserPassword.mock.calls[0]!
      expect(storedHash).not.toBe('NewPass123')
      expect(await bcrypt.compare('NewPass123', storedHash)).toBe(true)
    })

    it('invalidates all refresh tokens after a successful password change', async () => {
      repo.findUserById.mockResolvedValue(fakeUser)
      repo.updateUserPassword.mockResolvedValue(undefined)
      repo.deleteAllRefreshTokensByUserId.mockResolvedValue(undefined)

      await service.changePassword('user-1', { currentPassword: 'OldPass1', newPassword: 'NewPass123' })

      expect(repo.deleteAllRefreshTokensByUserId).toHaveBeenCalledWith('user-1')
    })
  })
})
