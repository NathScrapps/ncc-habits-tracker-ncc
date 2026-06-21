import type { PrismaClient, NutritionistProfile, PatientProfile } from '@prisma/client'

export class NutritionistsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findNutritionistByUserId(userId: string): Promise<NutritionistProfile | null> {
    return this.prisma.nutritionistProfile.findUnique({ where: { userId } })
  }

  async findPatientById(patientId: string): Promise<PatientProfile | null> {
    return this.prisma.patientProfile.findUnique({ where: { id: patientId } })
  }

  async assignPatient(nutritionistId: string, patientId: string): Promise<PatientProfile> {
    return this.prisma.patientProfile.update({
      where: { id: patientId },
      data: { nutritionistId },
    })
  }

  async unassignPatient(patientId: string): Promise<void> {
    await this.prisma.patientProfile.update({
      where: { id: patientId },
      data: { nutritionistId: null },
    })
  }
}
