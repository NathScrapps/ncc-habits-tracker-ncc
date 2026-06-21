import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PatientsService } from '../service'
import { ForbiddenError } from '../../../common/errors/AppError'
import type { PatientsRepository } from '../repository'

function makeMockRepo() {
  return {
    findNutritionistByUserId: vi.fn(),
    findAssignedPatients: vi.fn(),
    findAssignedPatientById: vi.fn(),
    findPatientHabits: vi.fn(),
    searchUnassignedPatients: vi.fn(),
  }
}

const nutritionist = { id: 'nutritionist-1', userId: 'user-N', fullName: 'Dr. Smith', createdAt: new Date() }

const patientA = { id: 'patient-A', userId: 'user-A', fullName: 'Alice', nutritionistId: 'nutritionist-1', createdAt: new Date() }
const patientB = { id: 'patient-B', userId: 'user-B', fullName: 'Bob', nutritionistId: 'nutritionist-1', createdAt: new Date() }

function makeHabitEntry(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'habit-1',
    patientId: 'patient-A',
    date: new Date('2026-06-19T00:00:00.000Z'),
    waterIntakeMl: 2500,
    exerciseMinutes: 45,
    sleepHours: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('PatientsService', () => {
  let service: PatientsService
  let repo: ReturnType<typeof makeMockRepo>

  beforeEach(() => {
    vi.clearAllMocks()
    repo = makeMockRepo()
    service = new PatientsService(repo as unknown as PatientsRepository)
  })

  // ---------------------------------------------------------------------------
  // searchPatients
  // ---------------------------------------------------------------------------
  describe('searchPatients', () => {
    const searchResult = [
      { id: 'patient-C', fullName: 'Carol', nutritionistId: null, createdAt: new Date(), user: { email: 'carol@test.com' } },
    ]

    it('returns matching unassigned patients as DTOs with email', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.searchUnassignedPatients.mockResolvedValue(searchResult)

      const result = await service.searchPatients('user-N', 'carol')

      expect(result).toEqual([{ id: 'patient-C', fullName: 'Carol', email: 'carol@test.com' }])
      expect(repo.searchUnassignedPatients).toHaveBeenCalledWith('carol')
    })

    it('returns empty array when no patients match', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.searchUnassignedPatients.mockResolvedValue([])

      const result = await service.searchPatients('user-N', 'nobody')

      expect(result).toEqual([])
    })

    it('throws ForbiddenError when the user is not a nutritionist', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(null)

      await expect(service.searchPatients('user-patient', 'carol')).rejects.toBeInstanceOf(ForbiddenError)
    })
  })

  // ---------------------------------------------------------------------------
  // listPatients
  // ---------------------------------------------------------------------------
  describe('listPatients', () => {
    it('returns DTOs of all assigned patients', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatients.mockResolvedValue([patientA, patientB])

      const result = await service.listPatients('user-N')

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ id: 'patient-A', fullName: 'Alice' })
      expect(result[1]).toMatchObject({ id: 'patient-B', fullName: 'Bob' })
    })

    it('returns an empty array when no patients are assigned', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatients.mockResolvedValue([])

      const result = await service.listPatients('user-N')

      expect(result).toEqual([])
    })

    it('throws ForbiddenError when the user is not a nutritionist', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(null)

      await expect(service.listPatients('user-patient')).rejects.toBeInstanceOf(ForbiddenError)
    })

    it('queries assigned patients using the nutritionist profile id, not the user id', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatients.mockResolvedValue([])

      await service.listPatients('user-N')

      expect(repo.findAssignedPatients).toHaveBeenCalledWith('nutritionist-1')
    })
  })

  // ---------------------------------------------------------------------------
  // getPatient
  // ---------------------------------------------------------------------------
  describe('getPatient', () => {
    it('returns a patient DTO for an assigned patient', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatientById.mockResolvedValue(patientA)

      const result = await service.getPatient('user-N', 'patient-A')

      expect(result).toMatchObject({ id: 'patient-A', fullName: 'Alice' })
    })

    it('throws ForbiddenError when the user is not a nutritionist', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(null)

      await expect(service.getPatient('user-patient', 'patient-A')).rejects.toBeInstanceOf(
        ForbiddenError,
      )
    })

    it('throws ForbiddenError when patient is not assigned to this nutritionist (no info leakage)', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatientById.mockResolvedValue(null)

      await expect(service.getPatient('user-N', 'patient-other')).rejects.toBeInstanceOf(
        ForbiddenError,
      )
    })

    it('verifies ownership by combining nutritionistId + patientId', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatientById.mockResolvedValue(patientA)

      await service.getPatient('user-N', 'patient-A')

      expect(repo.findAssignedPatientById).toHaveBeenCalledWith('nutritionist-1', 'patient-A')
    })
  })

  // ---------------------------------------------------------------------------
  // getPatientHabits
  // ---------------------------------------------------------------------------
  describe('getPatientHabits', () => {
    it('returns habit DTOs for an assigned patient', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatientById.mockResolvedValue(patientA)
      repo.findPatientHabits.mockResolvedValue([makeHabitEntry(), makeHabitEntry({ id: 'habit-2' })])

      const result = await service.getPatientHabits('user-N', 'patient-A', { days: 30 })

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ id: 'habit-1', waterIntakeMl: 2500 })
    })

    it('throws ForbiddenError when the user is not a nutritionist', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(null)

      await expect(
        service.getPatientHabits('user-patient', 'patient-A', { days: 30 }),
      ).rejects.toBeInstanceOf(ForbiddenError)
    })

    it('throws ForbiddenError when trying to access habits of a non-assigned patient', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatientById.mockResolvedValue(null)

      await expect(
        service.getPatientHabits('user-N', 'patient-other', { days: 30 }),
      ).rejects.toBeInstanceOf(ForbiddenError)
    })

    it('maps sleepHours to a number and date to YYYY-MM-DD string', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findAssignedPatientById.mockResolvedValue(patientA)
      repo.findPatientHabits.mockResolvedValue([makeHabitEntry({ sleepHours: 7.5 })])

      const [entry] = await service.getPatientHabits('user-N', 'patient-A', { days: 30 })

      expect(typeof entry!.sleepHours).toBe('number')
      expect(entry!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})
