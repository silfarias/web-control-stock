import { z } from 'zod'
import type {
  CreateSucursalRequest,
  Sucursal,
  UpdateSucursalRequest,
} from '@/features/sucursales/types'

const optionalText = (max: number, label: string) =>
  z.string().max(max, `${label} no puede superar los ${max} caracteres.`)

export const sucursalFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Ingresá el nombre de la sucursal.')
    .max(120, 'El nombre no puede superar los 120 caracteres.'),
  codigo: z
    .string()
    .trim()
    .min(1, 'Ingresá el código de la sucursal.')
    .max(40, 'El código no puede superar los 40 caracteres.')
    .regex(
      /^[A-Za-z0-9_-]+$/,
      'Usá solo letras, números, guiones o guión bajo.',
    ),
  direccion: optionalText(255, 'La dirección'),
  telefono: optionalText(40, 'El teléfono'),
  activo: z.boolean(),
})

export type SucursalFormValues = z.infer<typeof sucursalFormSchema>

export const emptySucursalFormValues: SucursalFormValues = {
  nombre: '',
  codigo: '',
  direccion: '',
  telefono: '',
  activo: true,
}

export function sucursalToFormValues(sucursal: Sucursal): SucursalFormValues {
  return {
    nombre: sucursal.nombre,
    codigo: sucursal.codigo,
    direccion: sucursal.direccion ?? '',
    telefono: sucursal.telefono ?? '',
    activo: sucursal.activo,
  }
}

function optionalField(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function toCreateSucursalRequest(values: SucursalFormValues): CreateSucursalRequest {
  return {
    nombre: values.nombre.trim(),
    codigo: values.codigo.trim().toUpperCase(),
    activo: values.activo,
    ...(optionalField(values.direccion) ? { direccion: optionalField(values.direccion) } : {}),
    ...(optionalField(values.telefono) ? { telefono: optionalField(values.telefono) } : {}),
  }
}

export function toUpdateSucursalRequest(values: SucursalFormValues): UpdateSucursalRequest {
  return {
    nombre: values.nombre.trim(),
    codigo: values.codigo.trim().toUpperCase(),
    direccion: values.direccion.trim(),
    telefono: values.telefono.trim(),
    activo: values.activo,
  }
}
