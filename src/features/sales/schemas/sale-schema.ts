import { z } from 'zod'
import type { CreateVentaRequest, MetodoPago } from '@/features/sales/types'
import { PAYMENT_METHODS } from '@/features/sales/utils/sale-labels'

const saleItemSchema = z.object({
  productoId: z.number().int().min(1),
  nombre: z.string(),
  codigo: z.string(),
  precioVentaRef: z.union([z.number(), z.string()]),
  stockDisponible: z.number().nullable(),
  cantidad: z
    .string()
    .trim()
    .min(1, 'Ingresá la cantidad.')
    .refine((value) => /^\d+$/.test(value), 'Ingresá un número entero.')
    .refine((value) => Number(value) >= 1, 'La cantidad debe ser al menos 1.'),
})

export const saleFormSchema = z
  .object({
    metodoPago: z
      .string()
      .min(1, 'Seleccioná un método de pago.')
      .refine((value) => PAYMENT_METHODS.includes(value as MetodoPago), {
        message: 'Seleccioná un método de pago válido.',
      }),
    items: z
      .array(saleItemSchema)
      .min(1, 'Agregá al menos un producto.')
      .superRefine((items, ctx) => {
        const seen = new Set<number>()
        items.forEach((item, index) => {
          if (seen.has(item.productoId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Este producto ya está en la venta.',
              path: [index, 'productoId'],
            })
          }
          seen.add(item.productoId)

          const qty = Number(item.cantidad)
          if (
            /^\d+$/.test(item.cantidad.trim()) &&
            item.stockDisponible != null &&
            qty > item.stockDisponible
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Stock disponible: ${item.stockDisponible}.`,
              path: [index, 'cantidad'],
            })
          }
        })
      }),
  })

export type SaleFormValues = z.infer<typeof saleFormSchema>
export type SaleFormItem = SaleFormValues['items'][number]

export const emptySaleFormValues: SaleFormValues = {
  metodoPago: 'EFECTIVO',
  items: [],
}

export function toCreateVentaRequest(values: SaleFormValues): CreateVentaRequest {
  return {
    metodoPago: values.metodoPago as MetodoPago,
    items: values.items.map((item) => ({
      productoId: item.productoId,
      cantidad: Number(item.cantidad),
    })),
  }
}

/** Total estimado a precios de catálogo (solo referencia visual). */
export function estimateSaleTotal(items: SaleFormItem[]) {
  let total = 0
  let complete = true

  for (const item of items) {
    if (!/^\d+$/.test(item.cantidad.trim())) {
      complete = false
      continue
    }
    const qty = Number(item.cantidad)
    const price = Number(item.precioVentaRef)
    if (!Number.isFinite(qty) || !Number.isFinite(price) || qty < 1) {
      complete = false
      continue
    }
    total += Number((qty * price).toFixed(2))
  }

  return { total: Number(total.toFixed(2)), complete }
}

export function estimateItemSubtotal(cantidad: string, precioRef: number | string) {
  if (!/^\d+$/.test(cantidad.trim())) return null
  const qty = Number(cantidad)
  const price = Number(precioRef)
  if (!Number.isFinite(qty) || !Number.isFinite(price) || qty < 1) return null
  return Number((qty * price).toFixed(2))
}
