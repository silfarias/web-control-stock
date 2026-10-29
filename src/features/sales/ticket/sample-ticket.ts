import type { Venta } from '@/features/sales/types'

const now = '2026-10-29T16:55:00.000Z'

/** Venta de ejemplo para ver el formato sin una venta real. */
export const sampleTicketSale: Venta = {
  id: 0,
  numero: 3,
  total: 2900,
  metodoPago: 'EFECTIVO',
  estado: 'CONFIRMADA',
  usuario: { id: 0, nombre: 'Cajero', email: 'cajero@local' },
  items: [
    {
      id: 1,
      cantidad: 1,
      precioUnitario: 2900,
      subtotal: 2900,
      producto: {
        id: 1,
        nombre: 'Lámpara delantera H4',
        codigo: 'ELE-004',
        codigoBarras: '7790000000001',
        precioCosto: 1500,
        precioVenta: 2900,
        minimoStock: 1,
        categoria: {
          id: 1,
          nombre: 'Iluminación',
          createdAt: now,
          updatedAt: now,
        },
        createdAt: now,
        updatedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    },
  ],
  createdAt: now,
  updatedAt: now,
}

export const sampleTicketCashReceived = 3000
