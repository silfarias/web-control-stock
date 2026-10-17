import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { reportKeys } from '@/features/reports/api/query-keys'
import type { CreateAjusteStockRequest } from '@/features/inventory/types'

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAjusteStockRequest) => inventoryApi.createAjuste(payload),
    retry: false,
    onSuccess: async (result) => {
      const productoId = result.stock.producto?.id
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
        ...(productoId != null
          ? [queryClient.setQueryData(inventoryKeys.stockByProduct(productoId), result.stock)]
          : []),
        queryClient.invalidateQueries({ queryKey: reportKeys.stockBajoRoot() }),
        queryClient.invalidateQueries({ queryKey: reportKeys.inventarioRoot() }),
      ])
    },
  })
}
