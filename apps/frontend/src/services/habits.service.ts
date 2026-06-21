import api from '@/lib/api-client'
import type { CreateHabitInput, HabitEntryDto, UpdateHabitInput } from '@/features/habits/habits.types'

export interface GetHabitsParams {
  days?: number
  from?: string
  to?: string
}

export async function getHabitsApi(params: GetHabitsParams = {}): Promise<HabitEntryDto[]> {
  const { data } = await api.get<HabitEntryDto[]>('/habits', { params })
  return data
}

export async function createHabitApi(input: CreateHabitInput): Promise<HabitEntryDto> {
  const { data } = await api.post<HabitEntryDto>('/habits', input)
  return data
}

export async function updateHabitApi(id: string, input: UpdateHabitInput): Promise<HabitEntryDto> {
  const { data } = await api.patch<HabitEntryDto>(`/habits/${id}`, input)
  return data
}
