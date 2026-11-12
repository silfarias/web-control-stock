import { z } from 'zod'
import type {
  CreateItemTransferenciaRequest,
  CreateTransferenciaRequest,
  Transferencia,
  UpdateTransferenciaRequest,
} from '@/features/transfers/types'

const transferItemSchema = z.object({
  productoId: z.number().int().min(1),
  nombre: z.string(),
  codigo: z.string(),
  cantidad: z
    .string()
    .trim()
    .min(1, 'Ingresá la cantidad.')
    .refine((value) => /^\d+$/.test(value), 'Ingresá un número entero.')
    .refine((value) => Number(value) >= 1, 'La cantidad debe ser al menos 1.'),
})

export const transferFormSchema = z
  .object({
    sucursalOrigenId: z
      .string()
      .trim()
      .min(1, 'Seleccioná la sucursal de origen.')
      .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
        message: 'Seleccioná una sucursal de origen válida.',
      }),
    sucursalDestinoId: z
      .string()
      .trim()
      .min(1, 'Seleccioná la sucursal de destino.')
      .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
        message: 'Seleccioná una sucursal de destino válida.',
      }),
    observacion: z
      .string()
      .max(500, 'La observación no puede superar los 500 caracteres.'),
    items: z
      .array(transferItemSchema)
      .min(1, 'Agregá al menos un producto.')
      .superRefine((items, ctx) => {
        const seen = new Set<number>()
        items.forEach((item, index) => {
          if (seen.has(item.productoId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Este producto ya está en la transferencia.',
              path: [index, 'productoId'],
            })
          }
          seen.add(item.productoId)
        })
      }),
  })
  .superRefine((values, ctx) => {
    if (
      values.sucursalOrigenId &&
      values.sucursalDestinoId &&
      values.sucursalOrigenId === values.sucursalDestinoId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Origen y destino deben ser sucursales distintas.',
        path: ['sucursalDestinoId'],
      })
    }
  })

export type TransferFormValues = z.infer<typeof transferFormSchema>
export type TransferFormItem = TransferFormValues['items'][number]

export const emptyTransferFormValues: TransferFormValues = {
  sucursalOrigenId: '',
  sucursalDestinoId: '',
  observacion: '',
  items: [],
}

export function transferToFormValues(transfer: Transferencia): TransferFormValues {
  return {
    sucursalOrigenId: String(transfer.sucursalOrigen.id),
    sucursalDestinoId: String(transfer.sucursalDestino.id),
    observacion: transfer.observacion ?? '',
    items: transfer.items.flatMap((item) => {
      if (!item.producto) return []
      return [
        {
          productoId: item.producto.id,
          nombre: item.producto.nombre,
          codigo: item.producto.codigo,
          cantidad: String(item.cantidad),
        },
      ]
    }),
  }
}

function toItemRequest(item: TransferFormItem): CreateItemTransferenciaRequest {
  return {
    productoId: item.productoId,
    cantidad: Number(item.cantidad),
  }
}

export function toCreateTransferenciaRequest(
  values: TransferFormValues,
): CreateTransferenciaRequest {
  const observacion = values.observacion.trim()
  return {
    sucursalOrigenId: Number(values.sucursalOrigenId),
    sucursalDestinoId: Number(values.sucursalDestinoId),
    ...(observacion ? { observacion } : {}),
    items: values.items.map(toItemRequest),
  }
}

export function toUpdateTransferenciaRequest(
  values: TransferFormValues,
): UpdateTransferenciaRequest {
  return {
    sucursalOrigenId: Number(values.sucursalOrigenId),
    sucursalDestinoId: Number(values.sucursalDestinoId),
    observacion: values.observacion.trim(),
    items: values.items.map(toItemRequest),
  }
}
