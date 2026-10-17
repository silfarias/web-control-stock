import type { BadgeTone } from '@/components/ui/Badge'
import type { EstadoVenta, MetodoPago } from '@/features/sales/types'

export function saleStatusLabel(estado: EstadoVenta): string {
  switch (estado) {
    case 'CONFIRMADA':
      return 'Confirmada'
    case 'CANCELADA':
      return 'Cancelada'
  }
}

export function saleStatusTone(estado: EstadoVenta): BadgeTone {
  switch (estado) {
    case 'CONFIRMADA':
      return 'success'
    case 'CANCELADA':
      return 'neutral'
  }
}

export function paymentMethodLabel(metodo: MetodoPago): string {
  switch (metodo) {
    case 'EFECTIVO':
      return 'Efectivo'
    case 'TRANSFERENCIA':
      return 'Transferencia'
    case 'TARJETA_DEBITO':
      return 'Tarjeta de débito'
    case 'TARJETA_CREDITO':
      return 'Tarjeta de crédito'
    case 'OTRO':
      return 'Otro'
  }
}

export const PAYMENT_METHODS: MetodoPago[] = [
  'EFECTIVO',
  'TRANSFERENCIA',
  'TARJETA_DEBITO',
  'TARJETA_CREDITO',
  'OTRO',
]

export const SALE_STATUSES: EstadoVenta[] = ['CONFIRMADA', 'CANCELADA']
