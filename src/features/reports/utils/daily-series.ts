import type { ReporteVentasDiarioItem } from '@/features/reports/types'
import { formatMoney, formatShortDate } from '@/lib/utils/format'

export type DailyPoint = {
  fecha: string
  cantidadVentas: number
  totalIngresos: number
}

const MAX_FILLED_DAYS = 45

function parseDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

function isoDay(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

/** Serie diaria continua. Los huecos de hasta 45 días quedan en cero para ver los días sin venta. */
export function buildDailySeries(items: ReporteVentasDiarioItem[]) {
  const merged = new Map<string, DailyPoint>()
  for (const item of items) {
    const day = parseDay(item.fecha)
    if (!day) continue
    const fecha = isoDay(day)
    const current = merged.get(fecha) ?? { fecha, cantidadVentas: 0, totalIngresos: 0 }
    current.cantidadVentas += Number(item.cantidadVentas) || 0
    current.totalIngresos += Number(item.totalIngresos) || 0
    merged.set(fecha, current)
  }

  const series = [...merged.values()].sort((a, b) => a.fecha.localeCompare(b.fecha))
  if (series.length === 0) return { points: [], filled: false }

  const start = parseDay(series[0].fecha)
  const end = parseDay(series[series.length - 1].fecha)
  if (!start || !end) return { points: series, filled: false }

  const span = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  if (span <= 1 || span > MAX_FILLED_DAYS) return { points: series, filled: false }

  const points: DailyPoint[] = []
  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const fecha = isoDay(cursor)
    points.push(merged.get(fecha) ?? { fecha, cantidadVentas: 0, totalIngresos: 0 })
  }
  return { points, filled: true }
}

export function dailyInsight(points: DailyPoint[], filled: boolean) {
  if (points.length === 0) return ''
  const best = points.reduce((current, point) =>
    point.totalIngresos > current.totalIngresos ? point : current,
  )
  if (points.length === 1) {
    const sales = best.cantidadVentas
    return `${formatShortDate(best.fecha)}: ${sales} venta${sales === 1 ? '' : 's'} por ${formatMoney(best.totalIngresos)}.`
  }

  const total = points.reduce((sum, point) => sum + point.totalIngresos, 0)
  const average = total / points.length
  const quiet = filled ? points.filter((point) => point.totalIngresos <= 0).length : 0
  const quietText =
    quiet > 0 ? ` ${quiet} ${quiet === 1 ? 'día' : 'días'} sin ventas.` : ''
  const averageLabel = filled ? 'El promedio diario' : 'El promedio de los días con ventas'
  return `El día más fuerte fue el ${formatShortDate(best.fecha)} (${formatMoney(best.totalIngresos)}). ${averageLabel} es ${formatMoney(average)}.${quietText}`
}
