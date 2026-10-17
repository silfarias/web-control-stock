import { z } from 'zod'
import type {
  CreateProveedorRequest,
  Proveedor,
  UpdateProveedorRequest,
} from '@/features/suppliers/types'

const optionalText = (max: number, label: string) =>
  z
    .string()
    .max(max, `${label} no puede superar los ${max} caracteres.`)

export const supplierFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Ingresá el nombre del proveedor.')
    .max(180, 'El nombre no puede superar los 180 caracteres.'),
  cuit: optionalText(30, 'El CUIT'),
  telefono: optionalText(40, 'El teléfono'),
  email: z
    .string()
    .max(180, 'El email no puede superar los 180 caracteres.')
    .refine((value) => {
      const trimmed = value.trim()
      if (!trimmed) return true
      return z.email().safeParse(trimmed).success
    }, 'Ingresá un email válido.'),
  direccion: optionalText(255, 'La dirección'),
  activo: z.boolean(),
})

export type SupplierFormValues = z.infer<typeof supplierFormSchema>

export const emptySupplierFormValues: SupplierFormValues = {
  nombre: '',
  cuit: '',
  telefono: '',
  email: '',
  direccion: '',
  activo: true,
}

export function supplierToFormValues(supplier: Proveedor): SupplierFormValues {
  return {
    nombre: supplier.nombre,
    cuit: supplier.cuit ?? '',
    telefono: supplier.telefono ?? '',
    email: supplier.email ?? '',
    direccion: supplier.direccion ?? '',
    activo: supplier.activo,
  }
}

function optionalField(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

export function toCreateProveedorRequest(values: SupplierFormValues): CreateProveedorRequest {
  return {
    nombre: values.nombre.trim(),
    activo: values.activo,
    ...(optionalField(values.cuit) ? { cuit: optionalField(values.cuit) } : {}),
    ...(optionalField(values.telefono) ? { telefono: optionalField(values.telefono) } : {}),
    ...(optionalField(values.email)
      ? { email: optionalField(values.email)!.toLowerCase() }
      : {}),
    ...(optionalField(values.direccion) ? { direccion: optionalField(values.direccion) } : {}),
  }
}

export function toUpdateProveedorRequest(values: SupplierFormValues): UpdateProveedorRequest {
  const email = values.email.trim()

  return {
    nombre: values.nombre.trim(),
    cuit: values.cuit.trim(),
    telefono: values.telefono.trim(),
    // Nest @IsEmail rechaza ""; null limpia (IsOptional) y el mapper trata falsy como undefined.
    email: email ? email.toLowerCase() : null,
    direccion: values.direccion.trim(),
    activo: values.activo,
  }
}
