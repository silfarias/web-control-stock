import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userKeys } from '@/features/users/api/query-keys'
import { usersApi } from '@/features/users/api/users-api'
import type { CreateUsuarioRequest, UpdateUsuarioRequest } from '@/features/users/types'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateUsuarioRequest) => usersApi.create(payload),
    retry: false,
    onSuccess: async (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user)
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUsuarioRequest }) =>
      usersApi.update(id, payload),
    retry: false,
    onSuccess: async (user) => {
      queryClient.setQueryData(userKeys.detail(user.id), user)
      await queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => usersApi.remove(id),
    retry: false,
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
        queryClient.removeQueries({ queryKey: userKeys.detail(id) }),
      ])
    },
  })
}
