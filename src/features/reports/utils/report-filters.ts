import type { FiltroReporte } from '@/features/reports/types'

/** Fecha de calendario YYYY-MM-DD (como espera la API). Sin conversión a Date/UTC. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function parseIsoDate(value: string | null): string | undefined {
  if (!value || !ISO_DATE.test(value)) return undefined
  return value
}

export function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : undefined
}

export function parseLimite(value: string | null): number | undefined {
  const parsed = parsePositiveInt(value)
  if (parsed == null) return undefined
  return Math.min(parsed, 100)
}

/** Filtros de ventas (fechas + categoría + producto). */
export function filtroVentasFromSearch(params: URLSearchParams): FiltroReporte {
  return {
    desde: parseIsoDate(params.get('desde')),
    hasta: parseIsoDate(params.get('hasta')),
    categoriaId: parsePositiveInt(params.get('categoriaId')),
    productoId: parsePositiveInt(params.get('productoId')),
  }
}

/** Filtros de top productos (incluye límite). */
export function filtroTopFromSearch(params: URLSearchParams): FiltroReporte {
  return {
    ...filtroVentasFromSearch(params),
    limite: parseLimite(params.get('limite')) ?? 10,
  }
}

/** Filtros de stock / inventario (sin fechas). */
export function filtroCatalogoFromSearch(params: URLSearchParams): FiltroReporte {
  return {
    categoriaId: parsePositiveInt(params.get('categoriaId')),
    productoId: parsePositiveInt(params.get('productoId')),
  }
}

export function hasActiveFilters(filtro: FiltroReporte, options?: { ignoreLimite?: boolean }) {
  if (filtro.desde || filtro.hasta) return true
  if (filtro.categoriaId != null || filtro.productoId != null) return true
  if (filtro.usuarioId != null) return true
  if (!options?.ignoreLimite && filtro.limite != null && filtro.limite !== 10) return true
  return false
}
