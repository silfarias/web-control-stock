import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { productKeys } from '@/features/products/api/query-keys'
import { reportKeys } from '@/features/reports/api/query-keys'
import { sucursalStore } from '@/features/sucursales/sucursal-store'
import type { CreateAjusteStockRequest } from '@/features/inventory/types'

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAjusteStockRequest) => inventoryApi.createAjuste(payload),
    retry: false,
    onSuccess: async (result) => {
      const productoId = result.stock.producto?.id
      const sucursalId = sucursalStore.getId()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        ...(productoId != null
          ? [
              queryClient.setQueryData(
                inventoryKeys.stockByProduct(sucursalId, productoId),
                result.stock,
              ),
            ]
          : []),
        queryClient.invalidateQueries({ queryKey: reportKeys.stockBajoRoot() }),
        queryClient.invalidateQueries({ queryKey: reportKeys.inventarioRoot() }),
      ])
    },
  })
}
