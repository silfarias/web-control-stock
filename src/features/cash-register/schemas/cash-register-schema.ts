import { z } from 'zod'
import type {
  AbrirCajaRequest,
  CerrarCajaRequest,
  CreateMovimientoCajaRequest,
} from '@/features/cash-register/types'

const moneyRegex = /^\d+([.,]\d{1,2})?$/

function parseMoneyInput(value: string) {
  return Number(value.trim().replace(',', '.'))
}

export const openCashFormSchema = z.object({
  montoApertura: z
    .string()
    .trim()
    .min(1, 'Ingresá el monto de apertura.')
    .refine((value) => moneyRegex.test(value), 'Usá un número con hasta 2 decimales.')
    .refine((value) => parseMoneyInput(value) >= 0, 'El monto no puede ser negativo.'),
})

export type OpenCashFormValues = z.infer<typeof openCashFormSchema>

export const emptyOpenCashFormValues: OpenCashFormValues = {
  montoApertura: '0',
}

export function toAbrirCajaRequest(values: OpenCashFormValues): AbrirCajaRequest {
  return {
    montoApertura: parseMoneyInput(values.montoApertura),
  }
}

export const closeCashFormSchema = z.object({
  montoCierre: z
    .string()
    .trim()
    .min(1, 'Ingresá el monto contado.')
    .refine((value) => moneyRegex.test(value), 'Usá un número con hasta 2 decimales.')
    .refine((value) => parseMoneyInput(value) >= 0, 'El monto no puede ser negativo.'),
})

export type CloseCashFormValues = z.infer<typeof closeCashFormSchema>

export const emptyCloseCashFormValues: CloseCashFormValues = {
  montoCierre: '',
}

export function toCerrarCajaRequest(values: CloseCashFormValues): CerrarCajaRequest {
  return {
    montoCierre: parseMoneyInput(values.montoCierre),
  }
}

export const cashMovementFormSchema = z.object({
  tipo: z.enum(['INGRESO', 'EGRESO'], {
    message: 'Seleccioná ingreso o egreso.',
  }),
  monto: z
    .string()
    .trim()
    .min(1, 'Ingresá el monto.')
    .refine((value) => moneyRegex.test(value), 'Usá un número con hasta 2 decimales.')
    .refine((value) => parseMoneyInput(value) >= 0.01, 'El monto debe ser mayor a 0.'),
  descripcion: z
    .string()
    .trim()
    .min(1, 'Ingresá una descripción.')
    .max(500, 'La descripción no puede superar los 500 caracteres.'),
})

export type CashMovementFormValues = z.infer<typeof cashMovementFormSchema>

export const emptyCashMovementFormValues: CashMovementFormValues = {
  tipo: 'INGRESO',
  monto: '',
  descripcion: '',
}

export function toCreateMovimientoCajaRequest(
  values: CashMovementFormValues,
): CreateMovimientoCajaRequest {
  return {
    tipo: values.tipo,
    monto: parseMoneyInput(values.monto),
    descripcion: values.descripcion.trim(),
  }
}
