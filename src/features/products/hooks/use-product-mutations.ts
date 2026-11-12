import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { productsApi } from '@/features/products/api/products-api'
import { productKeys } from '@/features/products/api/query-keys'
import { reportKeys } from '@/features/reports/api/query-keys'
import { sucursalStore } from '@/features/sucursales/sucursal-store'
import type {
  CreateProductoRequest,
  UpdateProductoRequest,
} from '@/features/products/types'

function invalidateProductReports(queryClient: QueryClient) {
  return Promise.all([
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
      const sucursalId = sucursalStore.getId()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.setQueryData(productKeys.detail(sucursalId, product.id), product),
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: productKeys.details() }),
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
        queryClient.invalidateQueries({ queryKey: productKeys.details() }),
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.removeQueries({
          predicate: (query) =>
            query.queryKey[0] === 'products' &&
            query.queryKey[1] === 'detail' &&
            query.queryKey.includes(id),
        }),
        invalidateProductReports(queryClient),
      ])
    },
  })
}
