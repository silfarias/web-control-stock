import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { ReportFilterValues } from '@/features/reports/components/ReportFiltersBar'
import {
  filtroCatalogoFromSearch,
  filtroTopFromSearch,
  filtroVentasFromSearch,
} from '@/features/reports/utils/report-filters'
import type { FiltroReporte } from '@/features/reports/types'

type FilterMode = 'ventas' | 'top' | 'catalogo'

function valuesFromFiltro(filtro: FiltroReporte): ReportFilterValues {
  return {
    desde: filtro.desde,
    hasta: filtro.hasta,
    categoriaId: filtro.categoriaId,
    productoId: filtro.productoId,
    limite: filtro.limite,
  }
}

function writeFiltroToParams(
  next: URLSearchParams,
  values: ReportFilterValues,
  mode: FilterMode,
) {
  if (mode === 'ventas' || mode === 'top') {
    if (values.desde) next.set('desde', values.desde)
    else next.delete('desde')
    if (values.hasta) next.set('hasta', values.hasta)
    else next.delete('hasta')
  } else {
    next.delete('desde')
    next.delete('hasta')
  }

  if (values.categoriaId != null) next.set('categoriaId', String(values.categoriaId))
  else next.delete('categoriaId')

  if (values.productoId != null) next.set('productoId', String(values.productoId))
  else next.delete('productoId')

  if (mode === 'top') {
    if (values.limite != null && values.limite !== 10) {
      next.set('limite', String(values.limite))
    } else {
      next.delete('limite')
    }
  } else {
    next.delete('limite')
  }
}

export function useReportFilterParams(mode: FilterMode) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filtro = useMemo(() => {
    if (mode === 'top') return filtroTopFromSearch(searchParams)
    if (mode === 'catalogo') return filtroCatalogoFromSearch(searchParams)
    return filtroVentasFromSearch(searchParams)
  }, [mode, searchParams])

  const values = useMemo(() => valuesFromFiltro(filtro), [filtro])

  const setValues = useCallback(
    (nextValues: ReportFilterValues) => {
      const next = new URLSearchParams(searchParams)
      writeFiltroToParams(next, nextValues, mode)
      setSearchParams(next, { replace: true })
    },
    [mode, searchParams, setSearchParams],
  )

  const clear = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    writeFiltroToParams(next, {}, mode)
    setSearchParams(next, { replace: true })
  }, [mode, searchParams, setSearchParams])

  return { filtro, values, setValues, clear }
}
