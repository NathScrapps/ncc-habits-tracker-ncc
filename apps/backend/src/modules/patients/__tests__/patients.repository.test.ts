import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PatientsRepository } from '../repository'

const mockPrisma = {
  nutritionistProfile: {
    findUnique: vi.fn(),
  },
  patientProfile: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
  },
  habitEntry: {
    findMany: vi.fn(),
  },
}

const mockFindMany = mockPrisma.patientProfile.findMany

describe('PatientsRepository', () => {
  let repo: PatientsRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new PatientsRepository(mockPrisma as any)
  })

  describe('findNutritionistByUserId', () => {
    it('queries by userId', async () => {
      mockPrisma.nutritionistProfile.findUnique.mockResolvedValue({ id: 'n-1' })

      const result = await repo.findNutritionistByUserId('user-N')

      expect(result).toEqual({ id: 'n-1' })
      expect(mockPrisma.nutritionistProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-N' },
      })
    })

    it('returns null when not a nutritionist', async () => {
      mockPrisma.nutritionistProfile.findUnique.mockResolvedValue(null)

      expect(await repo.findNutritionistByUserId('user-patient')).toBeNull()
    })
  })

  describe('findAssignedPatients', () => {
    it('returns patients filtered by nutritionistId, ordered by fullName', async () => {
      const patients = [{ id: 'p-1' }, { id: 'p-2' }]
      mockPrisma.patientProfile.findMany.mockResolvedValue(patients)

      const result = await repo.findAssignedPatients('n-1')

      expect(result).toEqual(patients)
      expect(mockPrisma.patientProfile.findMany).toHaveBeenCalledWith({
        where: { nutritionistId: 'n-1' },
        orderBy: { fullName: 'asc' },
      })
    })
  })

  describe('findAssignedPatientById', () => {
    it('finds a patient only when both id and nutritionistId match', async () => {
      mockPrisma.patientProfile.findFirst.mockResolvedValue({ id: 'p-1' })

      await repo.findAssignedPatientById('n-1', 'p-1')

      expect(mockPrisma.patientProfile.findFirst).toHaveBeenCalledWith({
        where: { id: 'p-1', nutritionistId: 'n-1' },
      })
    })

    it('returns null when the patient is not assigned to this nutritionist', async () => {
      mockPrisma.patientProfile.findFirst.mockResolvedValue(null)

      expect(await repo.findAssignedPatientById('n-1', 'p-other')).toBeNull()
    })
  })

  describe('searchUnassignedPatients', () => {
    it('searches by fullName and email, only unassigned, ordered by fullName, limited to 20', async () => {
      mockFindMany.mockResolvedValue([])

      await repo.searchUnassignedPatients('carol')

      expect(mockFindMany).toHaveBeenCalledWith({
        where: {
          nutritionistId: null,
          OR: [
            { fullName: { contains: 'carol', mode: 'insensitive' } },
            { user: { email: { contains: 'carol', mode: 'insensitive' } } },
          ],
        },
        include: { user: { select: { email: true } } },
        orderBy: { fullName: 'asc' },
        take: 20,
      })
    })

    it('returns matched patients with email included', async () => {
      const patient = { id: 'p-1', fullName: 'Carol', user: { email: 'carol@test.com' } }
      mockFindMany.mockResolvedValue([patient])

      const result = await repo.searchUnassignedPatients('carol')

      expect(result).toEqual([patient])
    })
  })

  describe('findPatientHabits', () => {
    it('filters by patientId and date cutoff, ordered by date desc', async () => {
      mockPrisma.habitEntry.findMany.mockResolvedValue([])

      await repo.findPatientHabits('p-1', 30)

      const call = mockPrisma.habitEntry.findMany.mock.calls[0]![0]
      expect(call.where.patientId).toBe('p-1')
      expect(call.where.date.gte).toBeInstanceOf(Date)
      expect(call.orderBy).toEqual({ date: 'desc' })
    })
  })
})
