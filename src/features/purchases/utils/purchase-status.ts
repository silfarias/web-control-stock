import type { BadgeTone } from '@/components/ui/Badge'
import type { EstadoCompra } from '@/features/purchases/types'

export function purchaseStatusLabel(estado: EstadoCompra): string {
  switch (estado) {
    case 'BORRADOR':
      return 'Borrador'
    case 'CONFIRMADA':
      return 'Confirmada'
    case 'CANCELADA':
      return 'Cancelada'
  }
}

export function purchaseStatusTone(estado: EstadoCompra): BadgeTone {
  switch (estado) {
    case 'BORRADOR':
      return 'warning'
    case 'CONFIRMADA':
      return 'success'
    case 'CANCELADA':
      return 'neutral'
  }
}
