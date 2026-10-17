import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { productsApi } from '@/features/products/api/products-api'
import { productKeys } from '@/features/products/api/query-keys'
import { reportKeys } from '@/features/reports/api/query-keys'
import type {
  CreateProductoRequest,
  UpdateProductoRequest,
} from '@/features/products/types'

function invalidateProductReports(queryClient: QueryClient) {
  return Promise.all([
    // Precios, mínimo y alta/baja afectan valorización y stock bajo; el nombre afecta ranking.
    queryClient.invalidateQueries({ queryKey: reportKeys.stockBajoRoot() }),
    queryClient.invalidateQueries({ queryKey: reportKeys.inventarioRoot() }),
    queryClient.invalidateQueries({ queryKey: reportKeys.productosTopRoot() }),
  ])
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateProductoRequest) => productsApi.create(payload),
    onSuccess: async (product) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.setQueryData(productKeys.detail(product.id), product),
        invalidateProductReports(queryClient),
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
        invalidateProductReports(queryClient),
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
        invalidateProductReports(queryClient),
      ])
    },
  })
}
