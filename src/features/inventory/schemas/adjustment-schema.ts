import { z } from 'zod'
import type { CreateAjusteStockRequest, TipoAjusteStock } from '@/features/inventory/types'

export const adjustmentFormSchema = z.object({
  tipo: z.enum(['AJUSTE_ENTRADA', 'AJUSTE_SALIDA'], {
    message: 'Seleccioná el tipo de ajuste.',
  }),
  cantidad: z
    .string()
    .trim()
    .min(1, 'Ingresá la cantidad.')
    .refine((value) => /^\d+$/.test(value), 'Ingresá un número entero.')
    .refine((value) => Number(value) >= 1, 'La cantidad debe ser al menos 1.'),
  motivo: z
    .string()
    .trim()
    .min(1, 'Ingresá el motivo del ajuste.')
    .max(500, 'El motivo no puede superar los 500 caracteres.'),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres.'),
})

export type AdjustmentFormValues = z.infer<typeof adjustmentFormSchema>

export const emptyAdjustmentFormValues: AdjustmentFormValues = {
  tipo: 'AJUSTE_ENTRADA',
  cantidad: '',
  motivo: '',
  descripcion: '',
}

export function toCreateAjusteRequest(
  productoId: number,
  values: AdjustmentFormValues,
): CreateAjusteStockRequest {
  const descripcion = values.descripcion.trim()
  return {
    productoId,
    tipo: values.tipo as TipoAjusteStock,
    cantidad: Number(values.cantidad),
    motivo: values.motivo.trim(),
    ...(descripcion ? { descripcion } : {}),
  }
}

export function estimateStockAfter(
  currentStock: number,
  tipo: TipoAjusteStock,
  cantidad: number,
): number {
  return tipo === 'AJUSTE_ENTRADA' ? currentStock + cantidad : currentStock - cantidad
}
