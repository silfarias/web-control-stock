import { useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '@/features/categories/api/categories-api'
import { categoryKeys } from '@/features/categories/api/query-keys'
import type {
  CreateCategoriaRequest,
  UpdateCategoriaRequest,
} from '@/features/categories/types'

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoriaRequest) => categoriesApi.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryKeys.lists() })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoriaRequest }) =>
      categoriesApi.update(id, payload),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.detail(variables.id) }),
      ])
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => categoriesApi.remove(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) }),
      ])
    },
  })
}
