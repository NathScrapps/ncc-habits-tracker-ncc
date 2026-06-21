import { Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useLogin } from '@/features/auth/hooks/use-login'
import { getErrorMessage } from '@/lib/get-error-message'

export function LoginPage() {
  const mutation = useLogin()

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <LoginForm
        onSubmit={mutation.mutate}
        isPending={mutation.isPending}
        error={mutation.error ? getErrorMessage(mutation.error) : null}
      />

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-deep-purple hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
