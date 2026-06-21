import type { PatientProfile } from '@prisma/client'
import { ConflictError, ForbiddenError, NotFoundError } from '../../common/errors/AppError'
import type { NutritionistsRepository } from './repository'
import type { AssignedPatientDto } from './types'

export class NutritionistsService {
  constructor(private readonly repo: NutritionistsRepository) {}

  async assignPatient(nutritionistUserId: string, patientId: string): Promise<AssignedPatientDto> {
    const nutritionist = await this.repo.findNutritionistByUserId(nutritionistUserId)
    if (!nutritionist) throw new ForbiddenError('Only nutritionists can manage patients')

    const patient = await this.repo.findPatientById(patientId)
    if (!patient) throw new NotFoundError('Patient not found')

    // Idempotent: already assigned to this nutritionist
    if (patient.nutritionistId === nutritionist.id) return this.toDto(patient)

    // Conflict: assigned to a different nutritionist
    if (patient.nutritionistId !== null) {
      throw new ConflictError('Patient is already assigned to another nutritionist')
    }

    const updated = await this.repo.assignPatient(nutritionist.id, patientId)
    return this.toDto(updated)
  }

  async unassignPatient(nutritionistUserId: string, patientId: string): Promise<void> {
    const nutritionist = await this.repo.findNutritionistByUserId(nutritionistUserId)
    if (!nutritionist) throw new ForbiddenError('Only nutritionists can manage patients')

    const patient = await this.repo.findPatientById(patientId)
    if (!patient) throw new NotFoundError('Patient not found')

    // 403 for both "not assigned" and "assigned to a different nutritionist"
    if (patient.nutritionistId !== nutritionist.id) {
      throw new ForbiddenError('Patient is not assigned to this nutritionist')
    }

    await this.repo.unassignPatient(patientId)
  }

  private toDto(patient: PatientProfile): AssignedPatientDto {
    return {
      id: patient.id,
      fullName: patient.fullName,
      createdAt: patient.createdAt.toISOString(),
    }
  }
}
