import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HabitsRepository } from '../repository'

const mockPrisma = {
  patientProfile: {
    findUnique: vi.fn(),
  },
  habitEntry: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}

describe('HabitsRepository', () => {
  let repo: HabitsRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repo = new HabitsRepository(mockPrisma as any)
  })

  describe('findPatientByUserId', () => {
    it('queries by userId', async () => {
      mockPrisma.patientProfile.findUnique.mockResolvedValue({ id: 'patient-1' })

      const result = await repo.findPatientByUserId('user-1')

      expect(result).toEqual({ id: 'patient-1' })
      expect(mockPrisma.patientProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
    })

    it('returns null when no patient profile exists', async () => {
      mockPrisma.patientProfile.findUnique.mockResolvedValue(null)

      expect(await repo.findPatientByUserId('user-nutritionist')).toBeNull()
    })
  })

  describe('findHabitByPatientAndDate', () => {
    it('uses the compound unique key to find a habit', async () => {
      const date = new Date('2026-06-19')
      mockPrisma.habitEntry.findUnique.mockResolvedValue({ id: 'habit-1' })

      await repo.findHabitByPatientAndDate('patient-1', date)

      expect(mockPrisma.habitEntry.findUnique).toHaveBeenCalledWith({
        where: { patientId_date: { patientId: 'patient-1', date } },
      })
    })
  })

  describe('createHabitEntry', () => {
    it('creates a habit entry with the provided data', async () => {
      const data = {
        patientId: 'patient-1',
        date: new Date('2026-06-19'),
        waterIntakeMl: 2500,
        exerciseMinutes: 45,
        sleepHours: 8,
      }
      mockPrisma.habitEntry.create.mockResolvedValue({ id: 'habit-1', ...data })

      const result = await repo.createHabitEntry(data)

      expect(result).toMatchObject({ id: 'habit-1' })
      expect(mockPrisma.habitEntry.create).toHaveBeenCalledWith({ data })
    })
  })

  describe('findHabitsByPatientId', () => {
    it('filters by patientId and date cutoff when no from/to are provided', async () => {
      mockPrisma.habitEntry.findMany.mockResolvedValue([])

      await repo.findHabitsByPatientId('patient-1', { days: 30 })

      const call = mockPrisma.habitEntry.findMany.mock.calls[0]![0]
      expect(call.where.patientId).toBe('patient-1')
      expect(call.where.date.gte).toBeInstanceOf(Date)
      expect(call.where.date.lte).toBeUndefined()
      expect(call.orderBy).toEqual({ date: 'desc' })
    })

    it('uses from/to bounds when provided instead of days cutoff', async () => {
      mockPrisma.habitEntry.findMany.mockResolvedValue([])

      await repo.findHabitsByPatientId('patient-1', {
        days: 30,
        from: '2026-06-01',
        to: '2026-06-15',
      })

      const call = mockPrisma.habitEntry.findMany.mock.calls[0]![0]
      expect(call.where.date.gte).toEqual(new Date('2026-06-01'))
      expect(call.where.date.lte).toEqual(new Date('2026-06-15'))
    })

    it('uses only from bound when to is omitted', async () => {
      mockPrisma.habitEntry.findMany.mockResolvedValue([])

      await repo.findHabitsByPatientId('patient-1', { days: 30, from: '2026-06-01' })

      const call = mockPrisma.habitEntry.findMany.mock.calls[0]![0]
      expect(call.where.date.gte).toEqual(new Date('2026-06-01'))
      expect(call.where.date.lte).toBeUndefined()
    })
  })

  describe('updateHabitEntry', () => {
    it('calls prisma update with the provided id and fields', async () => {
      const updated = { id: 'habit-1', waterIntakeMl: 3000 }
      mockPrisma.habitEntry.update.mockResolvedValue(updated)

      const result = await repo.updateHabitEntry('habit-1', { waterIntakeMl: 3000 })

      expect(result).toEqual(updated)
      expect(mockPrisma.habitEntry.update).toHaveBeenCalledWith({
        where: { id: 'habit-1' },
        data: { waterIntakeMl: 3000 },
      })
    })
  })

  describe('findHabitById', () => {
    it('finds a habit by id', async () => {
      mockPrisma.habitEntry.findUnique.mockResolvedValue({ id: 'habit-1' })

      const result = await repo.findHabitById('habit-1')

      expect(result).toEqual({ id: 'habit-1' })
      expect(mockPrisma.habitEntry.findUnique).toHaveBeenCalledWith({ where: { id: 'habit-1' } })
    })
  })
})
