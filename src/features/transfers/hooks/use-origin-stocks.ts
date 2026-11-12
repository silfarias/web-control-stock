import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import type { ProductStockMap } from '@/features/inventory/hooks/use-product-stock'

/** Stock de productos en una sucursal concreta (origen de la transferencia). */
export function useOriginProductStocks(
  sucursalOrigenId: number | null,
  productoIds: number[],
) {
  const stableIds = [...productoIds].sort((a, b) => a - b)

  return useQuery({
    queryKey: inventoryKeys.stocksFor(sucursalOrigenId, stableIds),
    queryFn: async (): Promise<ProductStockMap> => {
      const entries = await Promise.all(
        stableIds.map(async (id) => {
          try {
            const stock = await inventoryApi.getByProductId(id, {
              sucursalId: sucursalOrigenId!,
            })
            return [id, stock.cantidad] as const
          } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
              return [id, null] as const
            }
            throw error
          }
        }),
      )
      return Object.fromEntries(entries)
    },
    enabled: sucursalOrigenId != null && sucursalOrigenId > 0 && stableIds.length > 0,
  })
}
