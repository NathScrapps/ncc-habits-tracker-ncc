import { Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { useRegister } from '@/features/auth/hooks/use-register'
import { getErrorMessage } from '@/lib/get-error-message'

export function RegisterPage() {
  const mutation = useRegister()

  return (
    <AuthLayout title="Create your account" subtitle="Start tracking your habits today">
      <RegisterForm
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
        error={mutation.error ? getErrorMessage(mutation.error) : null}
      />

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-deep-purple hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
