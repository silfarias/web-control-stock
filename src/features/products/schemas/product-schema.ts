import { z } from 'zod'
import type {
  CreateProductoRequest,
  Producto,
  UpdateProductoRequest,
} from '@/features/products/types'
import { isValidMoneyInput, parseMoneyInput, toMoneyInputValue } from '@/lib/utils/money-input'

/** Esquema sin transforms: RHF trabaja con strings; la conversión numérica va al mapear al DTO. */
export const productFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Ingresá el nombre del producto.')
    .max(120, 'El nombre no puede superar los 120 caracteres.'),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres.'),
  codigo: z
    .string()
    .trim()
    .min(1, 'Ingresá el código interno.')
    .max(80, 'El código no puede superar los 80 caracteres.'),
  codigoBarras: z
    .string()
    .trim()
    .min(1, 'Ingresá el código de barras.')
    .max(80, 'El código de barras no puede superar los 80 caracteres.'),
  categoriaId: z
    .string()
    .trim()
    .min(1, 'Seleccioná una categoría.')
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
      message: 'Seleccioná una categoría válida.',
    }),
  precioCosto: z
    .string()
    .trim()
    .min(1, 'Ingresá un importe.')
    .refine((value) => isValidMoneyInput(value), 'Usá un número con hasta 2 decimales.')
    .refine((value) => parseMoneyInput(value) >= 0, 'El importe no puede ser negativo.'),
  precioVenta: z
    .string()
    .trim()
    .min(1, 'Ingresá un importe.')
    .refine((value) => isValidMoneyInput(value), 'Usá un número con hasta 2 decimales.')
    .refine((value) => parseMoneyInput(value) >= 0, 'El importe no puede ser negativo.'),
  minimoStock: z
    .string()
    .trim()
    .min(1, 'Ingresá un valor.')
    .refine((value) => /^\d+$/.test(value), 'Ingresá un número entero.')
    .refine((value) => Number(value) >= 0, 'Debe ser un entero mayor o igual a 0.'),
  stockInicial: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d+$/.test(value), 'Ingresá un número entero.')
    .refine(
      (value) => value === '' || Number(value) >= 0,
      'Debe ser un entero mayor o igual a 0.',
    ),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export function productToFormValues(product: Producto): ProductFormValues {
  return {
    nombre: product.nombre,
    descripcion: product.descripcion ?? '',
    codigo: product.codigo,
    codigoBarras: product.codigoBarras,
    categoriaId: String(product.categoria.id),
    precioCosto: toMoneyInputValue(product.precioCosto),
    precioVenta: toMoneyInputValue(product.precioVenta),
    minimoStock: String(product.minimoStock),
    stockInicial: '',
  }
}

export const emptyProductFormValues: ProductFormValues = {
  nombre: '',
  descripcion: '',
  codigo: '',
  codigoBarras: '',
  categoriaId: '',
  precioCosto: '',
  precioVenta: '',
  minimoStock: '0',
  stockInicial: '',
}

export function toCreateProductoRequest(values: ProductFormValues): CreateProductoRequest {
  const descripcion = values.descripcion.trim()
  const payload: CreateProductoRequest = {
    nombre: values.nombre.trim(),
    codigo: values.codigo.trim(),
    codigoBarras: values.codigoBarras.trim(),
    categoriaId: Number(values.categoriaId),
    precioCosto: parseMoneyInput(values.precioCosto),
    precioVenta: parseMoneyInput(values.precioVenta),
    minimoStock: Number(values.minimoStock),
  }

  if (descripcion) {
    payload.descripcion = descripcion
  }

  if (values.stockInicial.trim() !== '') {
    payload.stock = { cantidad: Number(values.stockInicial) }
  }

  return payload
}

/**
 * Alta rápida desde compra: código/código de barras opcionales y sin stock inicial
 * (el stock entra al confirmar la compra).
 */
export const purchaseProductQuickFormSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'Ingresá el nombre del producto.')
    .max(120, 'El nombre no puede superar los 120 caracteres.'),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede superar los 500 caracteres.'),
  codigo: z.string().trim().max(80, 'El código no puede superar los 80 caracteres.'),
  codigoBarras: z
    .string()
    .trim()
    .max(80, 'El código de barras no puede superar los 80 caracteres.'),
  categoriaId: z
    .string()
    .trim()
    .min(1, 'Seleccioná una categoría.')
    .refine((value) => /^\d+$/.test(value) && Number(value) >= 1, {
      message: 'Seleccioná una categoría válida.',
    }),
  precioCosto: z
    .string()
    .trim()
    .min(1, 'Ingresá un importe.')
    .refine((value) => isValidMoneyInput(value), 'Usá un número con hasta 2 decimales.')
    .refine((value) => parseMoneyInput(value) >= 0, 'El importe no puede ser negativo.'),
  precioVenta: z
    .string()
    .trim()
    .min(1, 'Ingresá un importe.')
    .refine((value) => isValidMoneyInput(value), 'Usá un número con hasta 2 decimales.')
    .refine((value) => parseMoneyInput(value) >= 0, 'El importe no puede ser negativo.'),
  minimoStock: z
    .string()
    .trim()
    .min(1, 'Ingresá un valor.')
    .refine((value) => /^\d+$/.test(value), 'Ingresá un número entero.')
    .refine((value) => Number(value) >= 0, 'Debe ser un entero mayor o igual a 0.'),
})

export type PurchaseProductQuickFormValues = z.infer<typeof purchaseProductQuickFormSchema>

export const emptyPurchaseProductQuickFormValues: PurchaseProductQuickFormValues = {
  nombre: '',
  descripcion: '',
  codigo: '',
  codigoBarras: '',
  categoriaId: '',
  precioCosto: '',
  precioVenta: '',
  minimoStock: '0',
}

/** Códigos únicos provisionales cuando aún no se conocen en la adquisición. */
function provisionalProductCode(prefix: string) {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefix}-${stamp}-${rand}`.slice(0, 80)
}

export function toCreateProductoFromPurchaseQuick(
  values: PurchaseProductQuickFormValues,
): CreateProductoRequest {
  const descripcion = values.descripcion.trim()
  const codigo = values.codigo.trim() || provisionalProductCode('TMP')
  const codigoBarras = values.codigoBarras.trim() || provisionalProductCode('EAN')

  const payload: CreateProductoRequest = {
    nombre: values.nombre.trim(),
    codigo,
    codigoBarras,
    categoriaId: Number(values.categoriaId),
    precioCosto: parseMoneyInput(values.precioCosto),
    precioVenta: parseMoneyInput(values.precioVenta),
    minimoStock: Number(values.minimoStock),
  }

  if (descripcion) {
    payload.descripcion = descripcion
  }

  return payload
}

export function toUpdateProductoRequest(values: ProductFormValues): UpdateProductoRequest {
  return {
    nombre: values.nombre.trim(),
    descripcion: values.descripcion.trim(),
    codigo: values.codigo.trim(),
    codigoBarras: values.codigoBarras.trim(),
    categoriaId: Number(values.categoriaId),
    precioCosto: parseMoneyInput(values.precioCosto),
    precioVenta: parseMoneyInput(values.precioVenta),
    minimoStock: Number(values.minimoStock),
  }
}
