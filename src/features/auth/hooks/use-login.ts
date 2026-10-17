import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'
import type { LoginRequest } from '@/features/auth/types'
import { getAuthErrorMessage } from '@/lib/api/errors'

export function useLogin() {
  const { login } = useAuth()

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    meta: {
      errorMapper: getAuthErrorMessage,
    },
  })
}
