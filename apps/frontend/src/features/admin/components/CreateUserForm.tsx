import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserFormValues } from '../admin.schemas'

interface CreateUserFormProps {
  onSubmit: (data: CreateUserFormValues) => void
  isPending: boolean
  error: string | null
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-deep-purple focus:ring-2 focus:ring-lavender disabled:opacity-50'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-500">
      {message}
    </p>
  )
}

const ROLE_LABELS: Record<string, string> = {
  PATIENT: 'Patient',
  NUTRITIONIST: 'Nutritionist',
  ADMIN: 'Admin',
}

export function CreateUserForm({ onSubmit, isPending, error }: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'PATIENT' },
    shouldUnregister: true,
  })

  const selectedRole = useWatch({ control, name: 'role' })
  const showFullName = selectedRole !== 'ADMIN'

  const handleValidSubmit = (data: CreateUserFormValues) => {
    onSubmit(data)
    reset()
  }

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} noValidate>
      {error && (
        <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
          Role
        </label>
        <select
          id="role"
          disabled={isPending}
          className={inputClass}
          {...register('role')}
        >
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <FieldError id="role-error" message={errors.role?.message} />
      </div>

      <div className="mb-4">
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isPending}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={inputClass}
          {...register('email')}
        />
        <FieldError id="email-error" message={errors.email?.message} />
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          disabled={isPending}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className={inputClass}
          {...register('password')}
        />
        <FieldError id="password-error" message={errors.password?.message} />
      </div>

      {showFullName && (
        <div className="mb-6">
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            disabled={isPending}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            className={inputClass}
            {...register('fullName')}
          />
          <FieldError id="fullName-error" message={errors.fullName?.message} />
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-deep-purple px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Creating…' : 'Create user'}
      </button>
    </form>
  )
}
