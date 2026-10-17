import { useQuery } from '@tanstack/react-query'
import { userKeys } from '@/features/users/api/query-keys'
import { usersApi } from '@/features/users/api/users-api'

export function useUser(id: number | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => usersApi.getById(id!),
    enabled: id != null && Number.isFinite(id) && id > 0,
  })
}
