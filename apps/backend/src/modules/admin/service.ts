import bcrypt from 'bcrypt'
import { ConflictError } from '../../common/errors/AppError'
import type { AdminRepository, AdminUserWithProfile } from './repository'
import type { CreateUserInput, ListUsersQuery, AdminUserDto } from './types'

const BCRYPT_ROUNDS = 12

export class AdminService {
  constructor(private readonly repo: AdminRepository) {}

  private toDto(user: AdminUserWithProfile): AdminUserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.patientProfile?.fullName ?? user.nutritionistProfile?.fullName ?? null,
      createdAt: user.createdAt.toISOString(),
    }
  }

  async createUser(input: CreateUserInput): Promise<AdminUserDto> {
    const existing = await this.repo.findUserByEmail(input.email)
    if (existing) throw new ConflictError('Email already in use')

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
    const user = await this.repo.createUser({
      email: input.email,
      passwordHash,
      role: input.role,
      fullName: input.fullName,
    })

    return this.toDto(user)
  }

  async listUsers(query: ListUsersQuery): Promise<AdminUserDto[]> {
    const users = await this.repo.listUsers(query.role)
    return users.map((u) => this.toDto(u))
  }
}
