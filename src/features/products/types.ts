import type { Categoria } from '@/features/categories/types'
import type { SearchParams } from '@/lib/api/types'

export type Producto = {
  id: number
  nombre: string
  descripcion?: string | null
  codigo: string
  codigoBarras: string
  precioCosto: number | string
  precioVenta: number | string
  minimoStock: number
  categoria: Categoria
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type SearchProductosParams = SearchParams & {
  id?: number
  nombre?: string
  codigo?: string
  codigoBarras?: string
  categoriaId?: number
}

export type CreateProductoStockRequest = {
  cantidad: number
}

export type CreateProductoRequest = {
  nombre: string
  descripcion?: string
  codigo: string
  codigoBarras: string
  categoriaId: number
  precioCosto: number
  precioVenta: number
  minimoStock: number
  stock?: CreateProductoStockRequest
}

export type UpdateProductoRequest = {
  nombre?: string
  descripcion?: string
  codigo?: string
  codigoBarras?: string
  categoriaId?: number
  precioCosto?: number
  precioVenta?: number
  minimoStock?: number
}
