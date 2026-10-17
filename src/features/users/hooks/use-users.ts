import { useQuery } from '@tanstack/react-query'
import { userKeys } from '@/features/users/api/query-keys'
import { usersApi } from '@/features/users/api/users-api'
import type { SearchUsuariosParams } from '@/features/users/types'

export function useUsers(params: SearchUsuariosParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersApi.search(params),
  })
}
