import type { PrismaClient, User } from '@prisma/client'
import type { Prisma } from '@prisma/client'

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    patientProfile: { select: { fullName: true } }
    nutritionistProfile: { select: { fullName: true } }
  }
}>

export class UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserWithProfile(userId: string): Promise<UserWithProfile | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: { select: { fullName: true } },
        nutritionistProfile: { select: { fullName: true } },
      },
    })
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } })
  }

  async updatePatientFullName(userId: string, fullName: string): Promise<void> {
    await this.prisma.patientProfile.update({ where: { userId }, data: { fullName } })
  }

  async updateNutritionistFullName(userId: string, fullName: string): Promise<void> {
    await this.prisma.nutritionistProfile.update({ where: { userId }, data: { fullName } })
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  }

  async deleteAllRefreshTokensByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } })
  }
}
