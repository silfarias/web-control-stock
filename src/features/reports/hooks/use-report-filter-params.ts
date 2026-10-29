import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import type { ReportFilterValues } from '@/features/reports/components/ReportFiltersBar'
import { productKeys } from '@/features/products/api/query-keys'
import { productsApi } from '@/features/products/api/products-api'
import type { Producto } from '@/features/products/types'
import {
  filtroCatalogoFromSearch,
  filtroTopFromSearch,
  filtroVentasFromSearch,
} from '@/features/reports/utils/report-filters'
import type { FiltroReporte } from '@/features/reports/types'

type FilterMode = 'ventas' | 'top' | 'catalogo'

export type ReportProductStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'ambiguous'

function valuesFromFiltro(filtro: FiltroReporte, codigo?: string): ReportFilterValues {
  return {
    fecha: filtro.fecha,
    desde: filtro.desde,
    hasta: filtro.hasta,
    categoriaId: filtro.categoriaId,
    codigo,
    limite: filtro.limite,
  }
}

function writeFiltroToParams(
  next: URLSearchParams,
  values: ReportFilterValues,
  mode: FilterMode,
) {
  if (mode === 'ventas' || mode === 'top') {
    if (values.fecha) next.set('fecha', values.fecha)
    else next.delete('fecha')
    if (values.desde) next.set('desde', values.desde)
    else next.delete('desde')
    if (values.hasta) next.set('hasta', values.hasta)
    else next.delete('hasta')
  } else {
    next.delete('fecha')
    next.delete('desde')
    next.delete('hasta')
  }

  if (values.categoriaId != null) next.set('categoriaId', String(values.categoriaId))
  else next.delete('categoriaId')

  const codigo = values.codigo?.trim()
  if (codigo) next.set('codigo', codigo)
  else next.delete('codigo')
  next.delete('productoId')

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

function pickProduct(products: Producto[], code: string) {
  const needle = code.trim().toLowerCase()
  const exact = products.find((product) => product.codigo.trim().toLowerCase() === needle)
  if (exact) return exact
  if (products.length === 1) return products[0]
  return undefined
}

export function useReportFilterParams(mode: FilterMode) {
  const [searchParams, setSearchParams] = useSearchParams()
  const codigo = searchParams.get('codigo')?.trim() || undefined

  const baseFiltro = useMemo(() => {
    if (mode === 'top') return filtroTopFromSearch(searchParams)
    if (mode === 'catalogo') return filtroCatalogoFromSearch(searchParams)
    return filtroVentasFromSearch(searchParams)
  }, [mode, searchParams])

  const lookup = useQuery({
    queryKey: productKeys.list({ codigo, pageSize: 10 }),
    queryFn: () => productsApi.search({ codigo, pageSize: 10 }),
    enabled: Boolean(codigo),
  })

  const match = useMemo(() => {
    if (!codigo || !lookup.data) return undefined
    return pickProduct(lookup.data.data, codigo)
  }, [codigo, lookup.data])

  let productStatus: ReportProductStatus = 'idle'
  if (codigo) {
    if (lookup.isPending) productStatus = 'loading'
    else if (lookup.isError || (lookup.data?.data.length ?? 0) === 0) productStatus = 'missing'
    else if (match) productStatus = 'ready'
    else productStatus = 'ambiguous'
  }

  const filtro = useMemo<FiltroReporte>(() => {
    const next: FiltroReporte = { ...baseFiltro }
    if (productStatus === 'ready' && match?.id != null) next.productoId = match.id
    return next
  }, [baseFiltro, match?.id, productStatus])

  const values = useMemo(() => valuesFromFiltro(baseFiltro, codigo), [baseFiltro, codigo])

  const productHint =
    productStatus === 'missing'
      ? 'No hay un producto con ese código.'
      : productStatus === 'ambiguous'
        ? 'Hay varios productos. Completá el código.'
        : undefined

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

  return {
    filtro,
    values,
    setValues,
    clear,
    productHint,
    reportEnabled: productStatus === 'idle' || productStatus === 'ready',
    productPending: productStatus === 'loading',
    productBlocked: productStatus === 'missing' || productStatus === 'ambiguous',
  }
}
