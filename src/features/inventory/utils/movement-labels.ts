import type { TipoMovimientoStock, TipoReferenciaMovimiento } from '@/features/inventory/types'

export type MovementDirection = 'in' | 'out'

export function movementTypeLabel(tipo: TipoMovimientoStock): string {
  switch (tipo) {
    case 'COMPRA':
      return 'Compra'
    case 'VENTA':
      return 'Venta'
    case 'AJUSTE_ENTRADA':
      return 'Ajuste (entrada)'
    case 'AJUSTE_SALIDA':
      return 'Ajuste (salida)'
    case 'TRANSFERENCIA_ENTRADA':
      return 'Transferencia (entrada)'
    case 'TRANSFERENCIA_SALIDA':
      return 'Transferencia (salida)'
  }
}

export function movementReferenceLabel(tipo: TipoReferenciaMovimiento): string {
  switch (tipo) {
    case 'AJUSTE':
      return 'Ajuste'
    case 'COMPRA':
      return 'Compra'
    case 'VENTA':
      return 'Venta'
    case 'TRANSFERENCIA':
      return 'Transferencia'
    case 'OTRO':
      return 'Otro'
  }
}

export function movementDirection(tipo: TipoMovimientoStock): MovementDirection {
  switch (tipo) {
    case 'COMPRA':
    case 'AJUSTE_ENTRADA':
    case 'TRANSFERENCIA_ENTRADA':
      return 'in'
    case 'VENTA':
    case 'AJUSTE_SALIDA':
    case 'TRANSFERENCIA_SALIDA':
      return 'out'
  }
}
