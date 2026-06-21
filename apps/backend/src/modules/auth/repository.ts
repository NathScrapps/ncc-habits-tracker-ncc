import type { PrismaClient, User, RefreshToken } from '@prisma/client'
import { Role } from '@prisma/client'

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async createUserWithPatientProfile(data: {
    email: string
    passwordHash: string
    fullName: string
  }): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        role: Role.PATIENT,
        patientProfile: { create: { fullName: data.fullName } },
      },
    })
  }

  async saveRefreshToken(data: {
    userId: string
    tokenHash: string
    expiresAt: Date
  }): Promise<void> {
    await this.prisma.refreshToken.create({ data })
  }

  async findRefreshTokensByUserId(userId: string): Promise<RefreshToken[]> {
    return this.prisma.refreshToken.findMany({ where: { userId } })
  }

  async deleteRefreshToken(id: string): Promise<void> {
    await this.prisma.refreshToken.delete({ where: { id } })
  }

  async deleteAllRefreshTokensByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } })
  }
}
