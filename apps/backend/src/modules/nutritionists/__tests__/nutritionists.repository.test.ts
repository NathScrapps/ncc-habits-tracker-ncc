import { describe, it, expect, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { NutritionistsRepository } from '../repository'

function mockPrismaClient() {
  return {
    nutritionistProfile: {
      findUnique: vi.fn(),
    },
    patientProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  }
}

describe('NutritionistsRepository', () => {
  describe('findNutritionistByUserId', () => {
    it('queries by userId', async () => {
      const mockPrisma = mockPrismaClient()
      const repo = new NutritionistsRepository(mockPrisma as unknown as PrismaClient)

      mockPrisma.nutritionistProfile.findUnique.mockResolvedValue(null)

      const result = await repo.findNutritionistByUserId('user-1')

      expect(mockPrisma.nutritionistProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
      expect(result).toBeNull()
    })
  })

  describe('findPatientById', () => {
    it('queries by patient id', async () => {
      const mockPrisma = mockPrismaClient()
      const repo = new NutritionistsRepository(mockPrisma as unknown as PrismaClient)

      mockPrisma.patientProfile.findUnique.mockResolvedValue(null)

      const result = await repo.findPatientById('patient-1')

      expect(mockPrisma.patientProfile.findUnique).toHaveBeenCalledWith({
        where: { id: 'patient-1' },
      })
      expect(result).toBeNull()
    })
  })

  describe('assignPatient', () => {
    it('updates patient nutritionistId', async () => {
      const mockPrisma = mockPrismaClient()
      const repo = new NutritionistsRepository(mockPrisma as unknown as PrismaClient)

      const updatedPatient = { id: 'patient-1', nutritionistId: 'nutri-1' }
      mockPrisma.patientProfile.update.mockResolvedValue(updatedPatient)

      const result = await repo.assignPatient('nutri-1', 'patient-1')

      expect(mockPrisma.patientProfile.update).toHaveBeenCalledWith({
        where: { id: 'patient-1' },
        data: { nutritionistId: 'nutri-1' },
      })
      expect(result).toEqual(updatedPatient)
    })
  })

  describe('unassignPatient', () => {
    it('sets nutritionistId to null', async () => {
      const mockPrisma = mockPrismaClient()
      const repo = new NutritionistsRepository(mockPrisma as unknown as PrismaClient)

      mockPrisma.patientProfile.update.mockResolvedValue({})

      await repo.unassignPatient('patient-1')

      expect(mockPrisma.patientProfile.update).toHaveBeenCalledWith({
        where: { id: 'patient-1' },
        data: { nutritionistId: null },
      })
    })
  })
})
