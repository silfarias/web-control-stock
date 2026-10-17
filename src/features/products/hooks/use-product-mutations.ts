import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { productsApi } from '@/features/products/api/products-api'
import { productKeys } from '@/features/products/api/query-keys'
import type {
  CreateProductoRequest,
  UpdateProductoRequest,
} from '@/features/products/types'

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductoRequest) => productsApi.create(payload),
    onSuccess: async (product) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.setQueryData(productKeys.detail(product.id), product),
      ])
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductoRequest }) =>
      productsApi.update(id, payload),
    onSuccess: async (product) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: productKeys.detail(product.id) }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
      ])
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.removeQueries({ queryKey: productKeys.detail(id) }),
      ])
    },
  })
}
