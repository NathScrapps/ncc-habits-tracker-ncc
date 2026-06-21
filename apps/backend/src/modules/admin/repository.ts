import type { PrismaClient } from '@prisma/client'
import type { Prisma } from '@prisma/client'
import { Role } from '@prisma/client'

export type AdminUserWithProfile = Prisma.UserGetPayload<{
  include: {
    patientProfile: { select: { fullName: true } }
    nutritionistProfile: { select: { fullName: true } }
  }
}>

const profileInclude = {
  patientProfile: { select: { fullName: true } },
  nutritionistProfile: { select: { fullName: true } },
} as const

export class AdminRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<AdminUserWithProfile | null> {
    return this.prisma.user.findUnique({ where: { email }, include: profileInclude })
  }

  async createUser(data: {
    email: string
    passwordHash: string
    role: Role
    fullName?: string
  }): Promise<AdminUserWithProfile> {
    const createData: Prisma.UserCreateInput = {
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
    }

    if (data.role === Role.PATIENT && data.fullName) {
      createData.patientProfile = { create: { fullName: data.fullName } }
    } else if (data.role === Role.NUTRITIONIST && data.fullName) {
      createData.nutritionistProfile = { create: { fullName: data.fullName } }
    }

    return this.prisma.user.create({ data: createData, include: profileInclude })
  }

  async listUsers(roleFilter?: Role): Promise<AdminUserWithProfile[]> {
    return this.prisma.user.findMany({
      where: roleFilter ? { role: roleFilter } : undefined,
      include: profileInclude,
      orderBy: { createdAt: 'desc' },
    })
  }
}
