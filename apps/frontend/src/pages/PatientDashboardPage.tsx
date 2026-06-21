import { useState } from 'react'
import { AppLayout } from '@/layouts/AppLayout'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { HabitForm } from '@/features/habits/components/HabitForm'
import { HabitChart } from '@/features/habits/components/HabitChart'
import { HabitSummaryCard } from '@/features/habits/components/HabitSummaryCard'
import { useHabits } from '@/features/habits/hooks/use-habits'
import { useCreateHabit } from '@/features/habits/hooks/use-create-habit'
import { useUpdateHabit } from '@/features/habits/hooks/use-update-habit'
import { getErrorMessage } from '@/lib/get-error-message'
import type { HabitFormValues } from '@/features/habits/habits.schemas'

function todayISO() {
  return new Date().toISOString().split('T')[0]!
}

export function PatientDashboardPage() {
  const today = todayISO()
  const [isEditing, setIsEditing] = useState(false)
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  // Always fetch today's entry independently of the chart filter
  const { data: todayData = [] } = useHabits({ from: today, to: today })
  const todayEntry = todayData[0]

  // Chart history uses the active filter; defaults to last 30 days
  const hasFilter = filterFrom !== '' || filterTo !== ''
  const chartParams = hasFilter
    ? { from: filterFrom || undefined, to: filterTo || undefined }
    : { days: 30 }
  const { data: chartHabits = [], isLoading } = useHabits(chartParams)

  const createMutation = useCreateHabit()
  const updateMutation = useUpdateHabit()

  const handleCreate = (data: HabitFormValues) => {
    createMutation.mutate(data)
  }

  const handleUpdate = (data: HabitFormValues) => {
    if (!todayEntry) return
    updateMutation.mutate(
      {
        id: todayEntry.id,
        data: {
          waterIntakeMl: data.waterIntakeMl,
          exerciseMinutes: data.exerciseMinutes,
          sleepHours: data.sleepHours,
        },
      },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const handleClearFilter = () => {
    setFilterFrom('')
    setFilterTo('')
  }

  if (isLoading && chartHabits.length === 0) return <LoadingSpinner />

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-deep-purple">My Habits</h1>
        <p className="mt-1 text-sm text-gray-400">{today}</p>
      </div>

      {/* Today's log */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          {isEditing ? "Edit Today's Log" : todayEntry ? "Today's Log" : 'Log Today'}
        </h2>

        {todayEntry && !isEditing ? (
          <HabitSummaryCard entry={todayEntry} onEdit={() => setIsEditing(true)} />
        ) : (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <HabitForm
              mode={isEditing ? 'edit' : 'create'}
              defaultDate={today}
              initialValues={
                isEditing
                  ? {
                      waterIntakeMl: todayEntry?.waterIntakeMl,
                      exerciseMinutes: todayEntry?.exerciseMinutes,
                      sleepHours: todayEntry?.sleepHours,
                    }
                  : undefined
              }
              onSubmit={isEditing ? handleUpdate : handleCreate}
              isPending={isEditing ? updateMutation.isPending : createMutation.isPending}
              error={
                isEditing
                  ? updateMutation.error
                    ? getErrorMessage(updateMutation.error)
                    : null
                  : createMutation.error
                    ? getErrorMessage(createMutation.error)
                    : null
              }
              onCancel={isEditing ? () => setIsEditing(false) : undefined}
            />
          </div>
        )}
      </section>

      {/* Date range filter */}
      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Filter History
        </h2>
        <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-from" className="text-xs font-medium text-gray-500">
              From
            </label>
            <input
              id="filter-from"
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-deep-purple focus:ring-2 focus:ring-lavender"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-to" className="text-xs font-medium text-gray-500">
              To
            </label>
            <input
              id="filter-to"
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-deep-purple focus:ring-2 focus:ring-lavender"
            />
          </div>
          {hasFilter && (
            <button
              type="button"
              onClick={handleClearFilter}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Reset
            </button>
          )}
          {hasFilter && (
            <p className="text-xs text-gray-400">
              Showing custom range
            </p>
          )}
        </div>
      </section>

      {/* History charts */}
      {chartHabits.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            {hasFilter ? 'Filtered History' : 'Last 30 Days'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HabitChart
              data={chartHabits}
              dataKey="waterIntakeMl"
              label="Water (ml)"
              color="#3b82f6"
              unit="ml"
            />
            <HabitChart
              data={chartHabits}
              dataKey="exerciseMinutes"
              label="Exercise (min)"
              color="#10b981"
              unit="min"
            />
            <HabitChart
              data={chartHabits}
              dataKey="sleepHours"
              label="Sleep (hrs)"
              color="#3b2a60"
              unit="hrs"
            />
          </div>
        </section>
      ) : (
        !isLoading && (
          <p className="text-center text-sm text-gray-400">No habit entries found for this period.</p>
        )
      )}
    </AppLayout>
  )
}
