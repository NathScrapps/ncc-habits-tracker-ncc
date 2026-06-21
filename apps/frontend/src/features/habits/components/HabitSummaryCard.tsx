import type { HabitEntryDto } from '../habits.types'

interface HabitSummaryCardProps {
  entry: HabitEntryDto
  onEdit?: () => void
}

function MetricTile({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl bg-light-gray px-4 py-4 text-center">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-deep-purple">{value}</p>
      <p className="text-xs text-gray-400">{unit}</p>
    </div>
  )
}

export function HabitSummaryCard({ entry, onEdit }: HabitSummaryCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">{entry.date}</p>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit today's habits"
            className="rounded-lg border border-lavender px-3 py-1.5 text-xs font-medium text-deep-purple transition hover:bg-lavender"
          >
            Edit
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <MetricTile label="Water" value={entry.waterIntakeMl} unit="ml" />
        <MetricTile label="Exercise" value={entry.exerciseMinutes} unit="min" />
        <MetricTile label="Sleep" value={entry.sleepHours} unit="hrs" />
      </div>
    </div>
  )
}
