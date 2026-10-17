import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import type { SearchMovimientosParams } from '@/features/inventory/types'

export function useStockMovements(
  params: SearchMovimientosParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: inventoryKeys.movementList(params),
    queryFn: () => inventoryApi.searchMovements(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  })
}

export function useProductMovements(
  productoId: number | null,
  params: SearchMovimientosParams = {},
) {
  return useQuery({
    queryKey: inventoryKeys.movementsByProduct(productoId ?? 0, params),
    queryFn: () => inventoryApi.getMovementsByProduct(productoId!, params),
    enabled: productoId != null && productoId > 0,
    placeholderData: keepPreviousData,
  })
}
