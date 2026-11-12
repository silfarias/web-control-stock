import type { BadgeTone } from '@/components/ui/Badge'
import type { EstadoTransferencia } from '@/features/transfers/types'

export function transferStatusLabel(estado: EstadoTransferencia): string {
  switch (estado) {
    case 'BORRADOR':
      return 'Borrador'
    case 'CONFIRMADA':
      return 'Confirmada'
    case 'CANCELADA':
      return 'Cancelada'
  }
}

export function transferStatusTone(estado: EstadoTransferencia): BadgeTone {
  switch (estado) {
    case 'BORRADOR':
      return 'warning'
    case 'CONFIRMADA':
      return 'success'
    case 'CANCELADA':
      return 'neutral'
  }
}
