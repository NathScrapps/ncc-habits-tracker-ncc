import type { HabitEntry } from '@prisma/client'
import { ConflictError, ForbiddenError, NotFoundError } from '../../common/errors/AppError'
import type { HabitsRepository } from './repository'
import type { CreateHabitInput, GetHabitsQuery, HabitEntryDto, UpdateHabitInput } from './types'

export class HabitsService {
  constructor(private readonly repo: HabitsRepository) {}

  private toDto(entry: HabitEntry): HabitEntryDto {
    return {
      id: entry.id,
      date: entry.date.toISOString().split('T')[0]!,
      waterIntakeMl: entry.waterIntakeMl,
      exerciseMinutes: entry.exerciseMinutes,
      sleepHours: Number(entry.sleepHours),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }
  }

  async create(userId: string, input: CreateHabitInput): Promise<HabitEntryDto> {
    const patient = await this.repo.findPatientByUserId(userId)
    if (!patient) throw new ForbiddenError('Only patients can create habit entries')

    const date = new Date(input.date)
    const existing = await this.repo.findHabitByPatientAndDate(patient.id, date)
    if (existing) throw new ConflictError('A habit entry already exists for this date')

    const entry = await this.repo.createHabitEntry({
      patientId: patient.id,
      date,
      waterIntakeMl: input.waterIntakeMl,
      exerciseMinutes: input.exerciseMinutes,
      sleepHours: input.sleepHours,
    })

    return this.toDto(entry)
  }

  async update(userId: string, id: string, input: UpdateHabitInput): Promise<HabitEntryDto> {
    const patient = await this.repo.findPatientByUserId(userId)
    if (!patient) throw new ForbiddenError('Only patients can edit habit entries')

    const entry = await this.repo.findHabitById(id)
    if (!entry) throw new NotFoundError('Habit entry not found')

    if (entry.patientId !== patient.id) throw new ForbiddenError('Access denied')

    const entryDate = entry.date.toISOString().split('T')[0]!
    const today = new Date().toISOString().split('T')[0]!
    if (entryDate !== today) throw new ForbiddenError('You can only edit today\'s habit entry')

    const updated = await this.repo.updateHabitEntry(id, input)
    return this.toDto(updated)
  }

  async getHistory(userId: string, query: GetHabitsQuery): Promise<HabitEntryDto[]> {
    const patient = await this.repo.findPatientByUserId(userId)
    if (!patient) throw new ForbiddenError('Only patients can view habit history')

    const entries = await this.repo.findHabitsByPatientId(patient.id, query)
    return entries.map((e) => this.toDto(e))
  }

  async getById(userId: string, id: string): Promise<HabitEntryDto> {
    const patient = await this.repo.findPatientByUserId(userId)
    if (!patient) throw new ForbiddenError('Only patients can view habit entries')

    const entry = await this.repo.findHabitById(id)
    if (!entry) throw new NotFoundError('Habit entry not found')

    // Ownership enforced in service layer (TDD §7)
    if (entry.patientId !== patient.id) throw new ForbiddenError('Access denied')

    return this.toDto(entry)
  }
}
