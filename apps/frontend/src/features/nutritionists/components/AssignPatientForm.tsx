import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  patientId: z.string().uuid('Must be a valid Patient UUID'),
})

type FormValues = z.infer<typeof schema>

interface AssignPatientFormProps {
  onSubmit: (patientId: string) => void
  isPending: boolean
  error: string | null
}

export function AssignPatientForm({ onSubmit, isPending, error }: AssignPatientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function submit(data: FormValues) {
    onSubmit(data.patientId)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <label htmlFor="patientId" className="mb-1 block text-sm font-medium text-gray-700">
        Patient ID (UUID)
      </label>
      <div className="flex gap-2">
        <input
          {...register('patientId')}
          id="patientId"
          type="text"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          disabled={isPending}
          aria-describedby={errors.patientId ? 'patientId-error' : undefined}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-deep-purple focus:outline-none focus:ring-2 focus:ring-lavender disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-deep-purple px-4 py-2 text-sm font-semibold text-lavender disabled:opacity-50"
        >
          {isPending ? 'Assigning…' : 'Assign'}
        </button>
      </div>
      {errors.patientId && (
        <p id="patientId-error" role="alert" className="mt-1 text-xs text-red-600">
          {errors.patientId.message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </form>
  )
}
