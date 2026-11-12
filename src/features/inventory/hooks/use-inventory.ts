import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type { SearchStockParams } from '@/features/inventory/types'

export function useInventory(
  params: SearchStockParams,
  options?: { enabled?: boolean },
) {
  const { sucursalId, isReady } = useSucursal()

  return useQuery({
    queryKey: inventoryKeys.stockList(sucursalId, params),
    queryFn: () => inventoryApi.search(params),
    placeholderData: keepPreviousData,
    enabled: isReady && (options?.enabled ?? true),
  })
}
