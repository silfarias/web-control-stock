import type { BadgeTone } from '@/components/ui/Badge'
import type { EstadoCaja, TipoMovimientoCaja } from '@/features/cash-register/types'

export function cashStatusLabel(estado: EstadoCaja): string {
  switch (estado) {
    case 'ABIERTA':
      return 'Abierta'
    case 'CERRADA':
      return 'Cerrada'
  }
}

export function cashStatusTone(estado: EstadoCaja): BadgeTone {
  switch (estado) {
    case 'ABIERTA':
      return 'success'
    case 'CERRADA':
      return 'neutral'
  }
}

export function cashMovementTypeLabel(tipo: TipoMovimientoCaja): string {
  switch (tipo) {
    case 'VENTA':
      return 'Venta'
    case 'INGRESO':
      return 'Ingreso'
    case 'EGRESO':
      return 'Egreso'
  }
}

export function cashMovementTypeTone(tipo: TipoMovimientoCaja): BadgeTone {
  switch (tipo) {
    case 'VENTA':
      return 'success'
    case 'INGRESO':
      return 'info'
    case 'EGRESO':
      return 'warning'
  }
}
