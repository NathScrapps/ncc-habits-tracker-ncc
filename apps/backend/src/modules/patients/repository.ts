import type { PrismaClient, NutritionistProfile, PatientProfile, HabitEntry, Prisma } from '@prisma/client'

export type PatientWithEmail = Prisma.PatientProfileGetPayload<{
  include: { user: { select: { email: true } } }
}>

export class PatientsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findNutritionistByUserId(userId: string): Promise<NutritionistProfile | null> {
    return this.prisma.nutritionistProfile.findUnique({ where: { userId } })
  }

  async findAssignedPatients(nutritionistId: string): Promise<PatientProfile[]> {
    return this.prisma.patientProfile.findMany({
      where: { nutritionistId },
      orderBy: { fullName: 'asc' },
    })
  }

  async findAssignedPatientById(
    nutritionistId: string,
    patientId: string,
  ): Promise<PatientProfile | null> {
    return this.prisma.patientProfile.findFirst({
      where: { id: patientId, nutritionistId },
    })
  }

  async searchUnassignedPatients(q: string): Promise<PatientWithEmail[]> {
    return this.prisma.patientProfile.findMany({
      where: {
        nutritionistId: null,
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { user: { email: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { user: { select: { email: true } } },
      orderBy: { fullName: 'asc' },
      take: 20,
    })
  }

  async findPatientHabits(patientId: string, days: number): Promise<HabitEntry[]> {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    cutoff.setUTCHours(0, 0, 0, 0)

    return this.prisma.habitEntry.findMany({
      where: { patientId, date: { gte: cutoff } },
      orderBy: { date: 'desc' },
    })
  }
}
