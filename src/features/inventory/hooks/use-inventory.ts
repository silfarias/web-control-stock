import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import type { SearchStockParams } from '@/features/inventory/types'

export function useInventory(params: SearchStockParams) {
  return useQuery({
    queryKey: inventoryKeys.stockList(params),
    queryFn: () => inventoryApi.search(params),
    placeholderData: keepPreviousData,
  })
}
