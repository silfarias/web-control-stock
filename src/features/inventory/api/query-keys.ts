import type { SearchMovimientosParams, SearchStockParams } from '@/features/inventory/types'

export const inventoryKeys = {
  all: ['inventory'] as const,
  stocks: () => [...inventoryKeys.all, 'stock'] as const,
  stockLists: () => [...inventoryKeys.stocks(), 'list'] as const,
  stockList: (sucursalId: number | null, params: SearchStockParams) =>
    [...inventoryKeys.stockLists(), sucursalId, params] as const,
  stockByProduct: (sucursalId: number | null, productoId: number) =>
    [...inventoryKeys.stocks(), 'product', sucursalId, productoId] as const,
  stocksFor: (sucursalId: number | null, productoIds: number[]) =>
    [
      ...inventoryKeys.stocks(),
      'batch',
      sucursalId,
      [...productoIds].sort((a, b) => a - b),
    ] as const,
  movements: () => [...inventoryKeys.all, 'movements'] as const,
  movementLists: () => [...inventoryKeys.movements(), 'list'] as const,
  movementList: (sucursalId: number | null, params: SearchMovimientosParams) =>
    [...inventoryKeys.movementLists(), sucursalId, params] as const,
  movementsByProduct: (
    sucursalId: number | null,
    productoId: number,
    params: SearchMovimientosParams,
  ) => [...inventoryKeys.movements(), 'product', sucursalId, productoId, params] as const,
}
