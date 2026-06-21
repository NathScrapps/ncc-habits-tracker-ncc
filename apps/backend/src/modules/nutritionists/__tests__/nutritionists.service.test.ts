import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PatientProfile, NutritionistProfile } from '@prisma/client'
import { NutritionistsService } from '../service'
import type { NutritionistsRepository } from '../repository'
import { ForbiddenError, NotFoundError, ConflictError } from '../../../common/errors/AppError'

function makeMockRepo() {
  return {
    findNutritionistByUserId: vi.fn(),
    findPatientById: vi.fn(),
    assignPatient: vi.fn(),
    unassignPatient: vi.fn(),
  }
}

const nutritionist: NutritionistProfile = {
  id: 'nutri-1',
  userId: 'user-nutri-1',
  fullName: 'Alice',
  createdAt: new Date('2024-01-01'),
}

const patient: PatientProfile = {
  id: 'patient-1',
  userId: 'user-patient-1',
  fullName: 'Bob',
  nutritionistId: null,
  createdAt: new Date('2024-01-02'),
}

describe('NutritionistsService', () => {
  let repo: ReturnType<typeof makeMockRepo>
  let service: NutritionistsService

  beforeEach(() => {
    repo = makeMockRepo()
    service = new NutritionistsService(repo as unknown as NutritionistsRepository)
  })

  describe('assignPatient', () => {
    it('assigns a patient and returns a DTO', async () => {
      const assignedPatient = { ...patient, nutritionistId: 'nutri-1' }
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findPatientById.mockResolvedValue(patient)
      repo.assignPatient.mockResolvedValue(assignedPatient)

      const dto = await service.assignPatient('user-nutri-1', 'patient-1')

      expect(repo.assignPatient).toHaveBeenCalledWith('nutri-1', 'patient-1')
      expect(dto).toEqual({
        id: 'patient-1',
        fullName: 'Bob',
        createdAt: assignedPatient.createdAt.toISOString(),
      })
    })

    it('throws ForbiddenError when no nutritionist profile exists', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(null)

      await expect(service.assignPatient('user-nutri-1', 'patient-1')).rejects.toBeInstanceOf(
        ForbiddenError,
      )
      expect(repo.findPatientById).not.toHaveBeenCalled()
    })

    it('throws NotFoundError when patient does not exist', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findPatientById.mockResolvedValue(null)

      await expect(service.assignPatient('user-nutri-1', 'patient-1')).rejects.toBeInstanceOf(
        NotFoundError,
      )
    })

    it('throws ConflictError when patient is already assigned to a different nutritionist', async () => {
      const patientWithOtherNutri = { ...patient, nutritionistId: 'nutri-other' }
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findPatientById.mockResolvedValue(patientWithOtherNutri)

      await expect(service.assignPatient('user-nutri-1', 'patient-1')).rejects.toBeInstanceOf(
        ConflictError,
      )
      expect(repo.assignPatient).not.toHaveBeenCalled()
    })

    it('is idempotent when patient is already assigned to this nutritionist', async () => {
      const alreadyAssigned = { ...patient, nutritionistId: 'nutri-1' }
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findPatientById.mockResolvedValue(alreadyAssigned)

      const dto = await service.assignPatient('user-nutri-1', 'patient-1')

      expect(repo.assignPatient).not.toHaveBeenCalled()
      expect(dto.id).toBe('patient-1')
    })
  })

  describe('unassignPatient', () => {
    it('unassigns a patient successfully', async () => {
      const assignedPatient = { ...patient, nutritionistId: 'nutri-1' }
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findPatientById.mockResolvedValue(assignedPatient)
      repo.unassignPatient.mockResolvedValue(undefined)

      await service.unassignPatient('user-nutri-1', 'patient-1')

      expect(repo.unassignPatient).toHaveBeenCalledWith('patient-1')
    })

    it('throws ForbiddenError when no nutritionist profile exists', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(null)

      await expect(service.unassignPatient('user-nutri-1', 'patient-1')).rejects.toBeInstanceOf(
        ForbiddenError,
      )
      expect(repo.findPatientById).not.toHaveBeenCalled()
    })

    it('throws NotFoundError when patient does not exist', async () => {
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findPatientById.mockResolvedValue(null)

      await expect(service.unassignPatient('user-nutri-1', 'patient-1')).rejects.toBeInstanceOf(
        NotFoundError,
      )
    })

    it('throws ForbiddenError when patient is not assigned to this nutritionist', async () => {
      const unassignedPatient = { ...patient, nutritionistId: null }
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findPatientById.mockResolvedValue(unassignedPatient)

      await expect(service.unassignPatient('user-nutri-1', 'patient-1')).rejects.toBeInstanceOf(
        ForbiddenError,
      )
      expect(repo.unassignPatient).not.toHaveBeenCalled()
    })

    it('throws ForbiddenError when patient is assigned to a different nutritionist', async () => {
      const patientWithOtherNutri = { ...patient, nutritionistId: 'nutri-other' }
      repo.findNutritionistByUserId.mockResolvedValue(nutritionist)
      repo.findPatientById.mockResolvedValue(patientWithOtherNutri)

      await expect(service.unassignPatient('user-nutri-1', 'patient-1')).rejects.toBeInstanceOf(
        ForbiddenError,
      )
      expect(repo.unassignPatient).not.toHaveBeenCalled()
    })
  })
})
