import type { MetodoPago } from '@/features/sales/types'

export type DashboardSummary = {
  salesToday: number
  salesDetail: string
  products: number
  productsDetail: string
  lowStock: number
  lowStockDetail: string
  movements: number
  movementsDetail: string
}

/** Variante operativa para EMPLEADO (sin endpoints /reporte). */
export type EmployeeDashboardSummary = {
  cashLabel: string
  cashDetail: string
  products: number
  productsDetail: string
  salesTotal: number
  salesDetail: string
  stockRecords: number
  stockDetail: string
}

export type SalesPoint = {
  label: string
  fullLabel: string
  value: number
}

export type RecentSale = {
  id: number
  displayId: string
  time: string
  payment: MetodoPago
  items: number
  total: number
}

export type LowStockItem = {
  productoId: number
  name: string
  sku: string
  stock: number
  minimum: number
}
