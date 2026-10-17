import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { inventoryKeys } from '@/features/inventory/api/query-keys'
import type { Stock } from '@/features/inventory/types'

export type ProductStockMap = Record<number, number | null>

async function fetchStockQuantity(productoId: number): Promise<number | null> {
  try {
    const stock = await inventoryApi.getByProductId(productoId)
    return stock.cantidad
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}

async function fetchStockRecord(productoId: number): Promise<Stock | null> {
  try {
    return await inventoryApi.getByProductId(productoId)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw error
  }
}

/** Stock completo de un producto (cantidad + producto anidado). */
export function useProductStockRecord(productoId: number | null) {
  return useQuery({
    queryKey: inventoryKeys.stockByProduct(productoId ?? 0),
    queryFn: () => fetchStockRecord(productoId!),
    enabled: productoId != null && productoId > 0,
  })
}

/** Solo la cantidad (compatibilidad con listado de productos). */
export function useProductStockQuantity(productoId: number | null) {
  return useQuery({
    queryKey: [...inventoryKeys.stockByProduct(productoId ?? 0), 'cantidad'] as const,
    queryFn: () => fetchStockQuantity(productoId!),
    enabled: productoId != null && productoId > 0,
  })
}

/** Cantidades de stock para los productos de la página actual. */
export function useProductStocks(productoIds: number[]) {
  const stableIds = [...productoIds].sort((a, b) => a - b)

  return useQuery({
    queryKey: inventoryKeys.stocksFor(stableIds),
    queryFn: async (): Promise<ProductStockMap> => {
      const entries = await Promise.all(
        stableIds.map(async (id) => [id, await fetchStockQuantity(id)] as const),
      )
      return Object.fromEntries(entries)
    },
    enabled: stableIds.length > 0,
  })
}
