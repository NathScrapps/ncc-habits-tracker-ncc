import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '@/services/auth.service'

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      // Backend creates the account; user logs in separately
      navigate('/login', { replace: true })
    },
  })
}
