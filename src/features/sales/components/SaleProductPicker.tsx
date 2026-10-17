import { useEffect, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useProductStocks } from '@/features/products/hooks/use-product-stocks'
import { useProducts } from '@/features/products/hooks/use-products'
import type { Producto } from '@/features/products/types'
import { formatMoney } from '@/lib/utils/format'

const PAGE_SIZE = 8

type SaleProductPickerProps = {
  excludedProductIds: number[]
  disabled?: boolean
  onAdd: (product: Producto, stockDisponible: number | null) => void
}

export function SaleProductPicker({
  excludedProductIds,
  disabled = false,
  onAdd,
}: SaleProductPickerProps) {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQ(searchInput.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const params = useMemo(
    () => ({
      q: debouncedQ || undefined,
      pageNumber: page,
      pageSize: PAGE_SIZE,
      orderBy: 'nombre',
      orderDirection: 'ASC' as const,
    }),
    [debouncedQ, page],
  )

  const productsQuery = useProducts(params)
  const products = productsQuery.data?.data ?? []
  const metadata = productsQuery.data?.metadata
  const productIds = products.map((product) => product.id)
  const stocksQuery = useProductStocks(productIds)
  const stocks = stocksQuery.data ?? {}
  const excluded = useMemo(() => new Set(excludedProductIds), [excludedProductIds])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative min-w-0">
        <Search
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar producto por nombre o código"
          className="pl-10"
          disabled={disabled}
          aria-label="Buscar productos para vender"
        />
      </div>

      {productsQuery.isLoading ? (
        <p className="px-1 text-sm text-muted">Buscando productos…</p>
      ) : null}

      {productsQuery.isError ? (
        <p className="px-1 text-sm text-error-ink" role="alert">
          No se pudieron cargar productos. Probá de nuevo.
        </p>
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? (
        <p className="px-1 text-sm text-muted">
          {debouncedQ
            ? 'No hay productos que coincidan con la búsqueda.'
            : 'Escribí para buscar productos del catálogo.'}
        </p>
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && products.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {products.map((product) => {
            const alreadyAdded = excluded.has(product.id)
            const stock = stocks[product.id]
            const stockLoading = stocksQuery.isLoading && stock === undefined
            const outOfStock = stock === 0 || stock === null

            return (
              <li
                key={product.id}
                className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{product.nombre}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {product.codigo}
                    <span className="mx-1.5 text-border">·</span>
                    {formatMoney(product.precioVenta)}
                    <span className="mx-1.5 text-border">·</span>
                    {stockLoading
                      ? 'Stock…'
                      : stock == null
                        ? 'Sin stock registrado'
                        : `Stock ${stock}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || alreadyAdded || outOfStock}
                  onClick={() => onAdd(product, stock ?? null)}
                  className="shrink-0 self-start sm:self-auto"
                >
                  <Plus className="size-4" aria-hidden />
                  {alreadyAdded ? 'Agregado' : outOfStock ? 'Sin stock' : 'Agregar'}
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {metadata && metadata.totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted">
            Página {metadata.pageNumber} de {metadata.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || productsQuery.isFetching || disabled}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= metadata.totalPages || productsQuery.isFetching || disabled}
              onClick={() => setPage((current) => current + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
