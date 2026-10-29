import type { ReporteVentasDiarioItem } from '@/features/reports/types'
import type { ReporteStockBajoItem } from '@/features/reports/types'
import type { Venta } from '@/features/sales/types'
import type { LowStockItem, RecentSale, SalesPoint } from '@/features/dashboard/types'
import { lastNLocalDates } from '@/features/dashboard/utils/dashboard-dates'
import { formatComprobante, formatShortDate } from '@/lib/utils/format'

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/** Serie de 7 días con huecos en 0 a partir del reporte diario del backend. */
export function buildSalesSeries(
  daily: ReporteVentasDiarioItem[],
  today = new Date(),
): SalesPoint[] {
  const byDate = new Map(daily.map((item) => [item.fecha.slice(0, 10), item.totalIngresos]))
  const shortFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'short' })

  return lastNLocalDates(7, today).map((iso) => {
    const [y, m, d] = iso.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    return {
      label: capitalize(shortFormatter.format(date).replaceAll('.', '')),
      fullLabel: capitalize(formatShortDate(iso).replaceAll('.', '')),
      value: Number(byDate.get(iso) ?? 0),
    }
  })
}

export function mapLowStockItems(items: ReporteStockBajoItem[]): LowStockItem[] {
  return items.map((item) => ({
    productoId: item.productoId,
    name: item.nombre,
    sku: item.codigo,
    stock: item.cantidad,
    minimum: item.minimoStock,
  }))
}

export function mapRecentSales(sales: Venta[]): RecentSale[] {
  return sales.map((sale) => {
    const created = new Date(sale.createdAt)
    const time = Number.isNaN(created.getTime())
      ? '—'
      : created.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

    return {
      id: sale.id,
      displayId: formatComprobante(sale.numero),
      time,
      payment: sale.metodoPago,
      items: sale.items?.reduce((sum, item) => sum + Number(item.cantidad || 0), 0) ?? 0,
      total: Number(sale.total) || 0,
    }
  })
}
