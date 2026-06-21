import type { PatientProfile, HabitEntry } from '@prisma/client'
import { ForbiddenError } from '../../common/errors/AppError'
import type { PatientsRepository, PatientWithEmail } from './repository'
import type { PatientHabitsQuery, PatientDto, HabitEntryDto, PatientSearchDto } from './types'

export class PatientsService {
  constructor(private readonly repo: PatientsRepository) {}

  private patientToDto(patient: PatientProfile): PatientDto {
    return {
      id: patient.id,
      fullName: patient.fullName,
      createdAt: patient.createdAt.toISOString(),
    }
  }

  private habitToDto(entry: HabitEntry): HabitEntryDto {
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

  async listPatients(nutritionistUserId: string): Promise<PatientDto[]> {
    const nutritionist = await this.repo.findNutritionistByUserId(nutritionistUserId)
    if (!nutritionist) throw new ForbiddenError('Only nutritionists can view patients')

    const patients = await this.repo.findAssignedPatients(nutritionist.id)
    return patients.map((p) => this.patientToDto(p))
  }

  async getPatient(nutritionistUserId: string, patientId: string): Promise<PatientDto> {
    const nutritionist = await this.repo.findNutritionistByUserId(nutritionistUserId)
    if (!nutritionist) throw new ForbiddenError('Only nutritionists can view patients')

    // Returns null for both non-existent and non-assigned patients (no info leakage)
    const patient = await this.repo.findAssignedPatientById(nutritionist.id, patientId)
    if (!patient) throw new ForbiddenError('Patient not found or not assigned to this nutritionist')

    return this.patientToDto(patient)
  }

  async searchPatients(nutritionistUserId: string, q: string): Promise<PatientSearchDto[]> {
    const nutritionist = await this.repo.findNutritionistByUserId(nutritionistUserId)
    if (!nutritionist) throw new ForbiddenError('Only nutritionists can search patients')

    const results = await this.repo.searchUnassignedPatients(q)
    return results.map((p: PatientWithEmail) => ({
      id: p.id,
      fullName: p.fullName,
      email: p.user.email,
    }))
  }

  async getPatientHabits(
    nutritionistUserId: string,
    patientId: string,
    query: PatientHabitsQuery,
  ): Promise<HabitEntryDto[]> {
    const nutritionist = await this.repo.findNutritionistByUserId(nutritionistUserId)
    if (!nutritionist) throw new ForbiddenError('Only nutritionists can view patients')

    const patient = await this.repo.findAssignedPatientById(nutritionist.id, patientId)
    if (!patient) throw new ForbiddenError('Patient not found or not assigned to this nutritionist')

    const habits = await this.repo.findPatientHabits(patientId, query.days)
    return habits.map((h) => this.habitToDto(h))
  }
}
