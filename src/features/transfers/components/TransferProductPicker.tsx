import { useEffect, useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { ListPagination } from '@/components/common/ListPagination'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useProducts } from '@/features/products/hooks/use-products'
import type { Producto } from '@/features/products/types'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'

type TransferProductPickerProps = {
  sucursalOrigenId: number | null
  excludedProductIds: number[]
  disabled?: boolean
  onAdd: (product: Producto) => void
}

export function TransferProductPicker({
  sucursalOrigenId,
  excludedProductIds,
  disabled = false,
  onAdd,
}: TransferProductPickerProps) {
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
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'nombre',
      orderDirection: 'ASC' as const,
    }),
    [debouncedQ, page],
  )

  const productsQuery = useProducts(params, {
    sucursalId: sucursalOrigenId,
    enabled: !disabled,
  })
  const products = productsQuery.data?.data ?? []
  const metadata = productsQuery.data?.metadata
  const excluded = useMemo(() => new Set(excludedProductIds), [excludedProductIds])

  if (sucursalOrigenId == null) {
    return (
      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
        <p className="text-sm font-medium">Elegí la sucursal de origen</p>
        <p className="mt-1 text-sm text-muted">
          Así podemos mostrar el stock disponible de cada producto.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Buscar por nombre o código"
        leadingIcon={<Search className="size-4" aria-hidden />}
        disabled={disabled}
        aria-label="Buscar productos para transferir"
      />

      {productsQuery.isLoading ? (
        <p className="px-1 text-sm text-muted">Cargando productos…</p>
      ) : null}

      {productsQuery.isError ? (
        <p className="px-1 text-sm text-error-ink" role="alert">
          No se pudieron cargar productos. Probá de nuevo.
        </p>
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm font-medium">
            {debouncedQ ? 'No hay coincidencias' : 'No hay productos en el catálogo'}
          </p>
          <p className="mt-1 text-sm text-muted">
            {debouncedQ
              ? `No encontramos “${debouncedQ}”.`
              : 'Cargá productos en el catálogo para poder transferirlos.'}
          </p>
        </div>
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && products.length > 0 ? (
        <ul className="max-h-[28rem] divide-y divide-border overflow-y-auto overscroll-contain rounded-xl border border-border lg:max-h-[min(32rem,calc(100dvh-16rem))]">
          {products.map((product) => {
            const alreadyAdded = excluded.has(product.id)
            const stock =
              typeof product.stockCantidad === 'number' ? product.stockCantidad : null
            return (
              <li
                key={product.id}
                className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{product.nombre}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">{product.codigo}</p>
                  <p className="mt-1 text-xs text-muted">
                    Stock en origen:{' '}
                    <span className="tabular-nums font-medium text-foreground">
                      {stock == null ? '—' : stock}
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={alreadyAdded ? 'outline' : 'secondary'}
                  className="shrink-0"
                  disabled={disabled || alreadyAdded}
                  onClick={() => onAdd(product)}
                >
                  <Plus className="size-4" aria-hidden />
                  {alreadyAdded ? 'Agregado' : 'Agregar'}
                </Button>
              </li>
            )
          })}
        </ul>
      ) : null}

      {metadata && metadata.totalPages > 1 ? (
        <ListPagination
          pageNumber={metadata.pageNumber}
          totalPages={metadata.totalPages}
          count={metadata.count}
          itemLabel={{ singular: 'producto', plural: 'productos' }}
          disabled={disabled || productsQuery.isFetching}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
