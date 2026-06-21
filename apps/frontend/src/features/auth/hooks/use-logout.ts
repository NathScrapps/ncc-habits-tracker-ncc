import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { logoutApi } from '@/services/auth.service'
import { useAuth } from './use-auth'

export function useLogout() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return useMutation({
    mutationFn: () => {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) return Promise.resolve()
      return logoutApi(refreshToken)
    },
    // Always clear local state even if the API call fails
    onSettled: () => {
      signOut()
      navigate('/login', { replace: true })
    },
  })
}
