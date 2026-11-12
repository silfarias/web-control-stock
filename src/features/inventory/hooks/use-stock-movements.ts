import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type { SearchMovimientosParams } from '@/features/inventory/types'

export function useStockMovements(
  params: SearchMovimientosParams,
  options?: { enabled?: boolean },
) {
  const { sucursalId, isReady } = useSucursal()

  return useQuery({
    queryKey: inventoryKeys.movementList(sucursalId, params),
    queryFn: () => inventoryApi.searchMovements(params),
    placeholderData: keepPreviousData,
    enabled: isReady && (options?.enabled ?? true),
  })
}

export function useProductMovements(
  productoId: number | null,
  params: SearchMovimientosParams = {},
) {
  const { sucursalId, isReady } = useSucursal()

  return useQuery({
    queryKey: inventoryKeys.movementsByProduct(sucursalId, productoId ?? 0, params),
    queryFn: () => inventoryApi.getMovementsByProduct(productoId!, params),
    enabled: isReady && productoId != null && productoId > 0,
    placeholderData: keepPreviousData,
  })
}
