import { HabitChart } from '@/features/habits/components/HabitChart'
import type { PatientHabitEntryDto } from '../nutritionists.types'

interface PatientHabitsPanelProps {
  habits: PatientHabitEntryDto[]
}

export function PatientHabitsPanel({ habits }: PatientHabitsPanelProps) {
  if (habits.length === 0) {
    return <p className="text-sm text-gray-400">No habit entries yet.</p>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <HabitChart data={habits} dataKey="waterIntakeMl" label="Water (ml)" color="#3b82f6" unit="ml" />
      <HabitChart
        data={habits}
        dataKey="exerciseMinutes"
        label="Exercise (min)"
        color="#10b981"
        unit="min"
      />
      <HabitChart data={habits} dataKey="sleepHours" label="Sleep (hrs)" color="#3b2a60" unit="hrs" />
    </div>
  )
}
