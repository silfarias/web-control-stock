import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Package, Plus, Search } from 'lucide-react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { ListPagination } from '@/components/common/ListPagination'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCategoryOptions } from '@/features/categories/hooks/use-category-options'
import { ProductsTable } from '@/features/products/components/ProductsTable'
import { useDeleteProduct } from '@/features/products/hooks/use-product-mutations'
import { useProductStocks } from '@/features/products/hooks/use-product-stocks'
import { useProducts } from '@/features/products/hooks/use-products'
import type { Producto } from '@/features/products/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'

function parsePage(value: string | null) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}

function parseCategoriaId(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

export function ProductsPage() {
  const { user } = useAuth()
  const canManage = user?.role === 'ADMIN'
  const { pushToast } = useToast()
  const deleteMutation = useDeleteProduct()
  const [deletingProduct, setDeletingProduct] = useState<Producto | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const qFromUrl = searchParams.get('q') ?? ''
  const pageFromUrl = parsePage(searchParams.get('page'))
  const categoriaIdFromUrl = parseCategoriaId(searchParams.get('categoriaId'))

  const [searchInput, setSearchInput] = useState(qFromUrl)
  const [urlQ, setUrlQ] = useState(qFromUrl)

  if (qFromUrl !== urlQ) {
    setUrlQ(qFromUrl)
    setSearchInput(qFromUrl)
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const next = searchInput.trim()
      if (next === qFromUrl) return

      const params = new URLSearchParams(searchParams)
      if (next) params.set('q', next)
      else params.delete('q')
      params.delete('page')
      setSearchParams(params, { replace: true })
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput, qFromUrl, searchParams, setSearchParams])

  const params = useMemo(
    () => ({
      q: qFromUrl || undefined,
      categoriaId: categoriaIdFromUrl,
      pageNumber: pageFromUrl,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: 'nombre',
      orderDirection: 'ASC' as const,
    }),
    [qFromUrl, categoriaIdFromUrl, pageFromUrl],
  )

  const productsQuery = useProducts(params)
  const products = productsQuery.data?.data ?? []
  const metadata = productsQuery.data?.metadata
  const productIds = products.map((product) => product.id)
  const stocksQuery = useProductStocks(productIds)

  const categoriesQuery = useCategoryOptions()
  const categories = categoriesQuery.data ?? []

  const hasFilters = Boolean(qFromUrl) || categoriaIdFromUrl != null
  const isEmpty = !productsQuery.isLoading && products.length === 0 && !hasFilters
  const isFilteredEmpty = !productsQuery.isLoading && products.length === 0 && hasFilters

  function updateParams(updater: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    updater(next)
    setSearchParams(next, { replace: true })
  }

  function handleCategoriaChange(value: string) {
    updateParams((next) => {
      if (value) next.set('categoriaId', value)
      else next.delete('categoriaId')
      next.delete('page')
    })
  }

  function setPage(page: number) {
    updateParams((next) => {
      if (page <= 1) next.delete('page')
      else next.set('page', String(page))
    })
  }

  async function handleDelete() {
    if (!deletingProduct) return
    try {
      await deleteMutation.mutateAsync(deletingProduct.id)
      pushToast({
        tone: 'success',
        title: 'Producto eliminado',
        description: `"${deletingProduct.nombre}" ya no aparece en los listados operativos.`,
      })
      setDeletingProduct(null)
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'No se pudo eliminar',
        description: getApiErrorMessage(error),
      })
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl">
          <h2 className="text-[1.75rem] leading-9 font-semibold tracking-tight">Productos</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Consultá el catálogo, filtrá por categoría y revisá precios y stock disponible.
          </p>
        </div>
        {canManage ? (
          <Link
            to="/productos/nuevo"
            className={cn(buttonVariants({ variant: 'primary' }), 'shrink-0')}
          >
            <Plus className="size-4" aria-hidden />
            Nuevo producto
          </Link>
        ) : null}
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 lg:max-w-md">
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscar por nombre, código o descripción"
              leadingIcon={<Search className="size-4" aria-hidden />}
              aria-label="Buscar productos"
            />
          </div>

          <label className="flex w-full items-center gap-2.5 text-sm lg:w-auto">
            <span className="shrink-0 font-medium whitespace-nowrap text-foreground">
              Categoría
            </span>
            <select
              value={categoriaIdFromUrl ?? ''}
              onChange={(event) => handleCategoriaChange(event.target.value)}
              disabled={categoriesQuery.isLoading}
              className={cn(
                'h-11 w-full min-w-0 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors lg:w-56',
                'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
                'disabled:cursor-not-allowed disabled:opacity-60',
              )}
              aria-label="Filtrar por categoría"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      {productsQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando productos…</p>
          <p className="mt-1 text-sm text-muted">Consultando la información del servidor.</p>
        </Card>
      ) : null}

      {productsQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudieron cargar los productos</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(productsQuery.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5 bg-surface"
            onClick={() => void productsQuery.refetch()}
          >
            Reintentar
          </Button>
        </Card>
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && isEmpty ? (
        <Card>
          <EmptyState
            icon={Package}
            title="Todavía no hay productos"
            description={
              canManage
                ? 'Creá el primer producto para empezar a armar el catálogo.'
                : 'Cuando un administrador cargue productos, van a aparecer acá.'
            }
            action={
              canManage ? (
                <Link to="/productos/nuevo" className={buttonVariants({ variant: 'primary' })}>
                  <Plus className="size-4" aria-hidden />
                  Nuevo producto
                </Link>
              ) : null
            }
          />
        </Card>
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && isFilteredEmpty ? (
        <Card>
          <EmptyState
            icon={Search}
            title="Sin resultados"
            description="No encontramos productos que coincidan con los filtros aplicados."
          />
        </Card>
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && products.length > 0 ? (
        <div className="flex flex-col gap-4">
          <ProductsTable
            products={products}
            stocks={stocksQuery.data ?? {}}
            stocksLoading={stocksQuery.isLoading || stocksQuery.isFetching}
            canManage={canManage}
            onDelete={setDeletingProduct}
          />

          {stocksQuery.isError ? (
            <p className="text-sm text-warning-ink">
              No se pudo cargar el stock de algunos productos. Los precios y datos del catálogo sí
              están disponibles.
            </p>
          ) : null}

          {metadata ? (
            <ListPagination
              pageNumber={metadata.pageNumber}
              totalPages={metadata.totalPages}
              count={metadata.count}
              itemLabel={{ singular: 'producto', plural: 'productos' }}
              disabled={productsQuery.isFetching}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open) setDeletingProduct(null)
        }}
        title="Eliminar producto"
        description={
          deletingProduct
            ? `Se va a dar de baja “${deletingProduct.nombre}”. Dejará de aparecer en los listados operativos (eliminación lógica).`
            : ''
        }
        confirmLabel="Eliminar"
        tone="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  )
}
