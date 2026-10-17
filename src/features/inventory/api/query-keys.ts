import type { SearchMovimientosParams, SearchStockParams } from '@/features/inventory/types'

export const inventoryKeys = {
  all: ['inventory'] as const,
  stocks: () => [...inventoryKeys.all, 'stock'] as const,
  stockLists: () => [...inventoryKeys.stocks(), 'list'] as const,
  stockList: (params: SearchStockParams) => [...inventoryKeys.stockLists(), params] as const,
  stockByProduct: (productoId: number) =>
    [...inventoryKeys.stocks(), 'product', productoId] as const,
  stocksFor: (productoIds: number[]) =>
    [...inventoryKeys.stocks(), 'batch', [...productoIds].sort((a, b) => a - b)] as const,
  movements: () => [...inventoryKeys.all, 'movements'] as const,
  movementLists: () => [...inventoryKeys.movements(), 'list'] as const,
  movementList: (params: SearchMovimientosParams) =>
    [...inventoryKeys.movementLists(), params] as const,
  movementsByProduct: (productoId: number, params: SearchMovimientosParams) =>
    [...inventoryKeys.movements(), 'product', productoId, params] as const,
}
