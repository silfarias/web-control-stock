import { z } from 'zod'
import type {
  Compra,
  CreateCompraRequest,
  CreateItemCompraRequest,
  UpdateCompraRequest,
} from '@/features/purchases/types'
import {
  isValidMoneyInput,
  parseMoneyInput,
  toMoneyInputValue,
} from '@/lib/utils/money-input'

export { parseMoneyInput }

export function formatMoneyInput(value: number | string) {
  const normalized = toMoneyInputValue(value)
  return normalized === '' ? '0' : normalized
}

const purchaseItemSchema = z.object({
  productoId: z.number().int().min(1),
  nombre: z.string(),
  codigo: z.string(),
  cantidad: z
    .string()
    .trim()
    .min(1, 'Ingresá la cantidad.')
    .refine((value) => /^\d+$/.test(value), 'Ingresá un número entero.')
    .refine((value) => Number(value) >= 1, 'La cantidad debe ser al menos 1.'),
  costoUnitario: z
    .string()
    .trim()
    .min(1, 'Ingresá el costo unitario.')
    .refine((value) => isValidMoneyInput(value), 'Usá un número con hasta 2 decimales.')
    .refine((value) => parseMoneyInput(value) >= 0, 'El costo no puede ser negativo.'),
})

export const purchaseFormSchema = z.object({
  proveedorId: z
    .string()
    .trim()
    .min(1, 'Seleccioná un proveedor.')
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
      message: 'Seleccioná un proveedor válido.',
    }),
  items: z
    .array(purchaseItemSchema)
    .min(1, 'Agregá al menos un producto.')
    .superRefine((items, ctx) => {
      const seen = new Set<number>()
      items.forEach((item, index) => {
        if (seen.has(item.productoId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Este producto ya está en la compra.',
            path: [index, 'productoId'],
          })
        }
        seen.add(item.productoId)
      })
    }),
})

export type PurchaseFormValues = z.infer<typeof purchaseFormSchema>
export type PurchaseFormItem = PurchaseFormValues['items'][number]

export const emptyPurchaseFormValues: PurchaseFormValues = {
  proveedorId: '',
  items: [],
}

export function purchaseToFormValues(purchase: Compra): PurchaseFormValues {
  return {
    proveedorId: String(purchase.proveedor.id),
    items: purchase.items.flatMap((item) => {
      if (!item.producto) return []
      return [
        {
          productoId: item.producto.id,
          nombre: item.producto.nombre,
          codigo: item.producto.codigo,
          cantidad: String(item.cantidad),
          costoUnitario: formatMoneyInput(item.costoUnitario),
        },
      ]
    }),
  }
}

function toItemRequest(item: PurchaseFormItem): CreateItemCompraRequest {
  return {
    productoId: item.productoId,
    cantidad: Number(item.cantidad),
    costoUnitario: parseMoneyInput(item.costoUnitario),
  }
}

export function toCreateCompraRequest(values: PurchaseFormValues): CreateCompraRequest {
  return {
    proveedorId: Number(values.proveedorId),
    items: values.items.map(toItemRequest),
  }
}

export function toUpdateCompraRequest(values: PurchaseFormValues): UpdateCompraRequest {
  return {
    proveedorId: Number(values.proveedorId),
    items: values.items.map(toItemRequest),
  }
}

/** Subtotal informativo (2 decimales), alineado al cálculo del backend. */
export function estimateItemSubtotal(cantidad: string, costoUnitario: string) {
  if (!/^\d+$/.test(cantidad.trim()) || !isValidMoneyInput(costoUnitario.trim())) return null
  const qty = Number(cantidad)
  const cost = parseMoneyInput(costoUnitario)
  if (!Number.isFinite(qty) || !Number.isFinite(cost) || qty < 1 || cost < 0) return null
  return Number((qty * cost).toFixed(2))
}

export function estimatePurchaseTotal(items: PurchaseFormItem[]) {
  let total = 0
  let complete = true
  for (const item of items) {
    const subtotal = estimateItemSubtotal(item.cantidad, item.costoUnitario)
    if (subtotal == null) {
      complete = false
      continue
    }
    total += subtotal
  }
  return {
    total: Number(total.toFixed(2)),
    complete,
  }
}
