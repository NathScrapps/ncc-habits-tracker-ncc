import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HabitsService } from '../service'
import { ConflictError, ForbiddenError, NotFoundError } from '../../../common/errors/AppError'
import type { HabitsRepository } from '../repository'

function makeMockRepo() {
  return {
    findPatientByUserId: vi.fn(),
    findHabitByPatientAndDate: vi.fn(),
    createHabitEntry: vi.fn(),
    updateHabitEntry: vi.fn(),
    findHabitsByPatientId: vi.fn(),
    findHabitById: vi.fn(),
  }
}

const patientA = { id: 'patient-A', userId: 'user-A', fullName: 'Alice', nutritionistId: null, createdAt: new Date() }
const patientB = { id: 'patient-B', userId: 'user-B', fullName: 'Bob', nutritionistId: null, createdAt: new Date() }

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

const validInput = {
  date: '2026-06-19',
  waterIntakeMl: 2500,
  exerciseMinutes: 45,
  sleepHours: 8,
}

describe('HabitsService', () => {
  let service: HabitsService
  let repo: ReturnType<typeof makeMockRepo>

  beforeEach(() => {
    vi.clearAllMocks()
    repo = makeMockRepo()
    service = new HabitsService(repo as unknown as HabitsRepository)
  })

  // ---------------------------------------------------------------------------
  // create
  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('returns a DTO when the entry is valid and the date is not taken', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitByPatientAndDate.mockResolvedValue(null)
      repo.createHabitEntry.mockResolvedValue(makeHabitEntry())

      const result = await service.create('user-A', validInput)

      expect(result.id).toBe('habit-1')
      expect(result.date).toBe('2026-06-19')
      expect(result.waterIntakeMl).toBe(2500)
      expect(result.sleepHours).toBe(8)
      expect(repo.createHabitEntry).toHaveBeenCalledOnce()
    })

    it('throws ForbiddenError when the user has no patient profile', async () => {
      repo.findPatientByUserId.mockResolvedValue(null)

      await expect(service.create('user-nutritionist', validInput)).rejects.toBeInstanceOf(
        ForbiddenError,
      )
      expect(repo.createHabitEntry).not.toHaveBeenCalled()
    })

    it('throws ConflictError when an entry already exists for that date', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitByPatientAndDate.mockResolvedValue(makeHabitEntry())

      await expect(service.create('user-A', validInput)).rejects.toBeInstanceOf(ConflictError)
      expect(repo.createHabitEntry).not.toHaveBeenCalled()
    })

    it('maps the DTO fields correctly (sleepHours as number, date as string)', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitByPatientAndDate.mockResolvedValue(null)
      repo.createHabitEntry.mockResolvedValue(makeHabitEntry({ sleepHours: 7.5 }))

      const result = await service.create('user-A', { ...validInput, sleepHours: 7.5 })

      expect(typeof result.sleepHours).toBe('number')
      expect(result.sleepHours).toBe(7.5)
      expect(typeof result.date).toBe('string')
      expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  // ---------------------------------------------------------------------------
  // update
  // ---------------------------------------------------------------------------
  describe('update', () => {
    const todayStr = new Date().toISOString().split('T')[0]!
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`)

    it('updates and returns the DTO when the entry belongs to the patient and is from today', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitById.mockResolvedValue(makeHabitEntry({ patientId: 'patient-A', date: todayDate }))
      const updatedEntry = makeHabitEntry({ patientId: 'patient-A', date: todayDate, waterIntakeMl: 3000 })
      repo.updateHabitEntry.mockResolvedValue(updatedEntry)

      const result = await service.update('user-A', 'habit-1', { waterIntakeMl: 3000 })

      expect(result.waterIntakeMl).toBe(3000)
      expect(repo.updateHabitEntry).toHaveBeenCalledWith('habit-1', { waterIntakeMl: 3000 })
    })

    it('throws ForbiddenError when the user has no patient profile', async () => {
      repo.findPatientByUserId.mockResolvedValue(null)

      await expect(service.update('user-nutritionist', 'habit-1', {})).rejects.toBeInstanceOf(ForbiddenError)
      expect(repo.updateHabitEntry).not.toHaveBeenCalled()
    })

    it('throws NotFoundError when the habit does not exist', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitById.mockResolvedValue(null)

      await expect(service.update('user-A', 'unknown', {})).rejects.toBeInstanceOf(NotFoundError)
    })

    it('throws ForbiddenError when Patient A tries to update Patient B habit', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitById.mockResolvedValue(makeHabitEntry({ patientId: patientB.id, date: todayDate }))

      await expect(service.update('user-A', 'habit-B', {})).rejects.toBeInstanceOf(ForbiddenError)
    })

    it('throws ForbiddenError when the entry is from a past date', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      const pastDate = new Date('2026-01-01T00:00:00.000Z')
      repo.findHabitById.mockResolvedValue(makeHabitEntry({ patientId: 'patient-A', date: pastDate }))

      await expect(service.update('user-A', 'habit-1', { waterIntakeMl: 1000 })).rejects.toBeInstanceOf(ForbiddenError)
      expect(repo.updateHabitEntry).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // getHistory
  // ---------------------------------------------------------------------------
  describe('getHistory', () => {
    it('returns the list of own habit entries', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitsByPatientId.mockResolvedValue([makeHabitEntry(), makeHabitEntry({ id: 'habit-2' })])

      const result = await service.getHistory('user-A', { days: 30 })

      expect(result).toHaveLength(2)
      expect(repo.findHabitsByPatientId).toHaveBeenCalledWith('patient-A', { days: 30 })
    })

    it('throws ForbiddenError when the user has no patient profile', async () => {
      repo.findPatientByUserId.mockResolvedValue(null)

      await expect(service.getHistory('user-nutritionist', { days: 30 })).rejects.toBeInstanceOf(
        ForbiddenError,
      )
    })

    it('returns an empty array when there are no habits in the period', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitsByPatientId.mockResolvedValue([])

      const result = await service.getHistory('user-A', { days: 7 })

      expect(result).toEqual([])
    })

    it('passes from/to filter to the repository when provided', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitsByPatientId.mockResolvedValue([makeHabitEntry()])

      const result = await service.getHistory('user-A', { days: 30, from: '2026-06-01', to: '2026-06-21' })

      expect(result).toHaveLength(1)
      expect(repo.findHabitsByPatientId).toHaveBeenCalledWith('patient-A', {
        days: 30,
        from: '2026-06-01',
        to: '2026-06-21',
      })
    })
  })

  // ---------------------------------------------------------------------------
  // getById
  // ---------------------------------------------------------------------------
  describe('getById', () => {
    it('returns the habit entry DTO for the owner', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitById.mockResolvedValue(makeHabitEntry({ patientId: 'patient-A' }))

      const result = await service.getById('user-A', 'habit-1')

      expect(result.id).toBe('habit-1')
    })

    it('throws NotFoundError when the habit does not exist', async () => {
      repo.findPatientByUserId.mockResolvedValue(patientA)
      repo.findHabitById.mockResolvedValue(null)

      await expect(service.getById('user-A', 'unknown-id')).rejects.toBeInstanceOf(NotFoundError)
    })

    it('throws ForbiddenError when the user has no patient profile', async () => {
      repo.findPatientByUserId.mockResolvedValue(null)

      await expect(service.getById('user-nutritionist', 'habit-1')).rejects.toBeInstanceOf(
        ForbiddenError,
      )
    })

    // *** CRITICAL AUTHORIZATION TEST (TDD §18) ***
    it('throws ForbiddenError when Patient A tries to read Patient B habit entry', async () => {
      // Patient A is authenticated
      repo.findPatientByUserId.mockResolvedValue(patientA)
      // Habit belongs to Patient B
      repo.findHabitById.mockResolvedValue(makeHabitEntry({ patientId: patientB.id }))

      await expect(service.getById('user-A', 'habit-owned-by-B')).rejects.toBeInstanceOf(
        ForbiddenError,
      )
    })
  })
})
