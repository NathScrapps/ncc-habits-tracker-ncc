import type { PrismaClient, HabitEntry, PatientProfile } from '@prisma/client'
import type { GetHabitsQuery, UpdateHabitInput } from './types'

export class HabitsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findPatientByUserId(userId: string): Promise<PatientProfile | null> {
    return this.prisma.patientProfile.findUnique({ where: { userId } })
  }

  async findHabitByPatientAndDate(patientId: string, date: Date): Promise<HabitEntry | null> {
    return this.prisma.habitEntry.findUnique({
      where: { patientId_date: { patientId, date } },
    })
  }

  async createHabitEntry(data: {
    patientId: string
    date: Date
    waterIntakeMl: number
    exerciseMinutes: number
    sleepHours: number
  }): Promise<HabitEntry> {
    return this.prisma.habitEntry.create({ data })
  }

  async updateHabitEntry(id: string, data: UpdateHabitInput): Promise<HabitEntry> {
    return this.prisma.habitEntry.update({ where: { id }, data })
  }

  async findHabitsByPatientId(patientId: string, query: GetHabitsQuery): Promise<HabitEntry[]> {
    const dateFilter: { gte?: Date; lte?: Date } = {}

    if (query.from || query.to) {
      if (query.from) dateFilter.gte = new Date(query.from)
      if (query.to) dateFilter.lte = new Date(query.to)
    } else {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - query.days)
      cutoff.setUTCHours(0, 0, 0, 0)
      dateFilter.gte = cutoff
    }

    return this.prisma.habitEntry.findMany({
      where: { patientId, date: dateFilter },
      orderBy: { date: 'desc' },
    })
  }

  async findHabitById(id: string): Promise<HabitEntry | null> {
    return this.prisma.habitEntry.findUnique({ where: { id } })
  }
}
