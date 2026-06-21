import bcrypt from 'bcrypt'
import { Role } from '@prisma/client'
import { BadRequestError, NotFoundError } from '../../common/errors/AppError'
import type { UsersRepository, UserWithProfile } from './repository'
import type { ChangePasswordInput, UpdateMeInput, UserProfileDto } from './types'

const BCRYPT_ROUNDS = 12

export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  async getMe(userId: string): Promise<UserProfileDto> {
    const user = await this.repo.findUserWithProfile(userId)
    if (!user) throw new NotFoundError('User not found')
    return this.toDto(user)
  }

  async updateMe(userId: string, role: Role, input: UpdateMeInput): Promise<UserProfileDto> {
    if (role === Role.PATIENT) {
      await this.repo.updatePatientFullName(userId, input.fullName)
    } else if (role === Role.NUTRITIONIST) {
      await this.repo.updateNutritionistFullName(userId, input.fullName)
    }
    // ADMIN has no profile — fullName update is a no-op
    return this.getMe(userId)
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await this.repo.findUserById(userId)
    if (!user) throw new NotFoundError('User not found')

    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash)
    if (!isValid) throw new BadRequestError('Current password is incorrect')

    const newHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS)
    await this.repo.updateUserPassword(userId, newHash)
    // Invalidate all sessions so the user must re-authenticate on every device
    await this.repo.deleteAllRefreshTokensByUserId(userId)
  }

  private toDto(user: UserWithProfile): UserProfileDto {
    const fullName = user.patientProfile?.fullName ?? user.nutritionistProfile?.fullName ?? ''
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName,
      createdAt: user.createdAt.toISOString(),
    }
  }
}
