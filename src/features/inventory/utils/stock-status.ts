import type { StockStatus } from '@/features/inventory/types'

/**
 * Criterio compartido con productos:
 * - sin stock: cantidad <= 0
 * - bajo mínimo: 0 < cantidad <= minimoStock
 * - disponible: cantidad > minimoStock
 * - desconocido: cantidad no disponible
 */
export function getStockStatus(
  cantidad: number | null | undefined,
  minimoStock: number,
): StockStatus {
  if (cantidad == null) return 'unknown'
  if (cantidad <= 0) return 'out'
  if (cantidad <= minimoStock) return 'low'
  return 'ok'
}

export function stockStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'out':
      return 'Sin stock'
    case 'low':
      return 'Bajo mínimo'
    case 'ok':
      return 'Disponible'
    case 'unknown':
      return 'Sin registro'
  }
}
