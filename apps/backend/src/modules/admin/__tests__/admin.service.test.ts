import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminService } from '../service'
import { ConflictError } from '../../../common/errors/AppError'
import { Role } from '@prisma/client'
import type { AdminRepository } from '../repository'

function makeMockRepo() {
  return {
    findUserByEmail: vi.fn(),
    createUser: vi.fn(),
    listUsers: vi.fn(),
  }
}

function makeAdminUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'user-1',
    email: 'test@example.com',
    role: Role.PATIENT,
    passwordHash: 'hashed',
    createdAt: new Date('2026-06-21T00:00:00.000Z'),
    updatedAt: new Date('2026-06-21T00:00:00.000Z'),
    patientProfile: null,
    nutritionistProfile: null,
    ...overrides,
  }
}

describe('AdminService', () => {
  let service: AdminService
  let repo: ReturnType<typeof makeMockRepo>

  beforeEach(() => {
    vi.clearAllMocks()
    repo = makeMockRepo()
    service = new AdminService(repo as unknown as AdminRepository)
  })

  // ---------------------------------------------------------------------------
  // createUser
  // ---------------------------------------------------------------------------
  describe('createUser', () => {
    it('creates a PATIENT user and returns the DTO with fullName', async () => {
      repo.findUserByEmail.mockResolvedValue(null)
      repo.createUser.mockResolvedValue(
        makeAdminUser({ role: Role.PATIENT, patientProfile: { fullName: 'Jane Doe' } }),
      )

      const result = await service.createUser({
        email: 'jane@example.com',
        password: 'Password1',
        role: Role.PATIENT,
        fullName: 'Jane Doe',
      })

      expect(result.role).toBe(Role.PATIENT)
      expect(result.fullName).toBe('Jane Doe')
      expect(repo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com', role: Role.PATIENT, fullName: 'Jane Doe' }),
      )
    })

    it('creates a NUTRITIONIST user with nutritionistProfile fullName', async () => {
      repo.findUserByEmail.mockResolvedValue(null)
      repo.createUser.mockResolvedValue(
        makeAdminUser({
          role: Role.NUTRITIONIST,
          nutritionistProfile: { fullName: 'Dr. Smith' },
        }),
      )

      const result = await service.createUser({
        email: 'dr@example.com',
        password: 'Password1',
        role: Role.NUTRITIONIST,
        fullName: 'Dr. Smith',
      })

      expect(result.role).toBe(Role.NUTRITIONIST)
      expect(result.fullName).toBe('Dr. Smith')
    })

    it('creates an ADMIN user with null fullName (no profile)', async () => {
      repo.findUserByEmail.mockResolvedValue(null)
      repo.createUser.mockResolvedValue(makeAdminUser({ role: Role.ADMIN }))

      const result = await service.createUser({
        email: 'admin@example.com',
        password: 'Password1',
        role: Role.ADMIN,
      })

      expect(result.role).toBe(Role.ADMIN)
      expect(result.fullName).toBeNull()
    })

    it('throws ConflictError when email is already in use', async () => {
      repo.findUserByEmail.mockResolvedValue(makeAdminUser())

      await expect(
        service.createUser({ email: 'taken@example.com', password: 'Password1', role: Role.PATIENT, fullName: 'Test' }),
      ).rejects.toBeInstanceOf(ConflictError)

      expect(repo.createUser).not.toHaveBeenCalled()
    })

    it('hashes the password before passing it to the repository', async () => {
      repo.findUserByEmail.mockResolvedValue(null)
      repo.createUser.mockResolvedValue(makeAdminUser())

      await service.createUser({
        email: 'new@example.com',
        password: 'PlainText1',
        role: Role.ADMIN,
      })

      const call = repo.createUser.mock.calls[0]![0] as { passwordHash: string }
      expect(call.passwordHash).not.toBe('PlainText1')
    })
  })

  // ---------------------------------------------------------------------------
  // listUsers
  // ---------------------------------------------------------------------------
  describe('listUsers', () => {
    it('returns all users as DTOs when no role filter is provided', async () => {
      repo.listUsers.mockResolvedValue([
        makeAdminUser({ id: 'u1', role: Role.PATIENT, patientProfile: { fullName: 'Alice' } }),
        makeAdminUser({ id: 'u2', role: Role.ADMIN }),
      ])

      const result = await service.listUsers({})

      expect(result).toHaveLength(2)
      expect(result[0]!.fullName).toBe('Alice')
      expect(result[1]!.fullName).toBeNull()
      expect(repo.listUsers).toHaveBeenCalledWith(undefined)
    })

    it('passes the role filter to the repository', async () => {
      repo.listUsers.mockResolvedValue([
        makeAdminUser({ role: Role.NUTRITIONIST, nutritionistProfile: { fullName: 'Dr. Z' } }),
      ])

      const result = await service.listUsers({ role: Role.NUTRITIONIST })

      expect(result[0]!.role).toBe(Role.NUTRITIONIST)
      expect(repo.listUsers).toHaveBeenCalledWith(Role.NUTRITIONIST)
    })
  })
})
