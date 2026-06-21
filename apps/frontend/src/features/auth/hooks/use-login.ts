import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { loginApi } from '@/services/auth.service'
import { useAuth } from './use-auth'

export function useLogin() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: ({ accessToken, refreshToken, user }) => {
      signIn(accessToken, refreshToken, user)
      const destination =
        user.role === 'NUTRITIONIST'
          ? '/nutritionist/patients'
          : user.role === 'ADMIN'
            ? '/admin/users'
            : '/patient/dashboard'
      navigate(destination, { replace: true })
    },
  })
}
