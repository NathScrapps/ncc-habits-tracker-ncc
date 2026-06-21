import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { habitSchema, type HabitFormValues } from '../habits.schemas'

interface HabitFormProps {
  onSubmit: (data: HabitFormValues) => void
  isPending: boolean
  error: string | null
  defaultDate?: string
  mode?: 'create' | 'edit'
  initialValues?: { waterIntakeMl?: number; exerciseMinutes?: number; sleepHours?: number }
  onCancel?: () => void
}

function todayISO() {
  return new Date().toISOString().split('T')[0]!
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-500">
      {message}
    </p>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-deep-purple focus:ring-2 focus:ring-lavender disabled:opacity-50'

export function HabitForm({ onSubmit, isPending, error, defaultDate, mode = 'create', initialValues, onCancel }: HabitFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      date: defaultDate ?? todayISO(),
      waterIntakeMl: initialValues?.waterIntakeMl ?? 0,
      exerciseMinutes: initialValues?.exerciseMinutes ?? 0,
      sleepHours: initialValues?.sleepHours ?? 0,
    },
  })

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {mode === 'create' && (
        <div className="mb-4">
          <label htmlFor="date" className="mb-1 block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            id="date"
            type="date"
            disabled={isPending}
            aria-describedby={errors.date ? 'date-error' : undefined}
            className={inputClass}
            {...register('date')}
          />
          <FieldError id="date-error" message={errors.date?.message} />
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="waterIntakeMl" className="mb-1 block text-sm font-medium text-gray-700">
          Water intake (ml)
        </label>
        <input
          id="waterIntakeMl"
          type="number"
          min="0"
          step="100"
          disabled={isPending}
          aria-describedby={errors.waterIntakeMl ? 'water-error' : undefined}
          className={inputClass}
          {...register('waterIntakeMl')}
        />
        <FieldError id="water-error" message={errors.waterIntakeMl?.message} />
      </div>

      <div className="mb-4">
        <label htmlFor="exerciseMinutes" className="mb-1 block text-sm font-medium text-gray-700">
          Exercise (minutes)
        </label>
        <input
          id="exerciseMinutes"
          type="number"
          min="0"
          step="5"
          disabled={isPending}
          aria-describedby={errors.exerciseMinutes ? 'exercise-error' : undefined}
          className={inputClass}
          {...register('exerciseMinutes')}
        />
        <FieldError id="exercise-error" message={errors.exerciseMinutes?.message} />
      </div>

      <div className="mb-6">
        <label htmlFor="sleepHours" className="mb-1 block text-sm font-medium text-gray-700">
          Sleep (hours)
        </label>
        <input
          id="sleepHours"
          type="number"
          min="0"
          max="24"
          step="0.25"
          disabled={isPending}
          aria-describedby={errors.sleepHours ? 'sleep-error' : undefined}
          className={inputClass}
          {...register('sleepHours')}
        />
        <FieldError id="sleep-error" message={errors.sleepHours?.message} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-lg bg-deep-purple px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving…' : mode === 'edit' ? 'Update habits' : 'Save habits'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
