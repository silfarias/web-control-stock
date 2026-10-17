import { Link } from 'react-router'
import { Card } from '@/components/ui/Card'
import type { LowStockItem } from '@/features/dashboard/types'
import { cn } from '@/lib/utils/cn'

type LowStockListProps = {
  items: LowStockItem[]
  loading?: boolean
  error?: boolean
  errorMessage?: string
  onRetry?: () => void
}

export function LowStockList({
  items,
  loading = false,
  error = false,
  errorMessage,
  onRetry,
}: LowStockListProps) {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Stock bajo</h2>
          <p className="mt-1 text-sm text-muted">
            {loading
              ? 'Cargando alertas…'
              : error
                ? 'No se pudo cargar.'
                : items.length === 0
                  ? 'Sin productos por debajo del mínimo.'
                  : `${items.length} producto${items.length === 1 ? '' : 's'} por debajo del mínimo.`}
          </p>
        </div>
        <Link
          to="/inventario"
          className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Inventario
        </Link>
      </div>

      {loading ? (
        <div className="mt-5 space-y-4" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-lg bg-surface-muted/70" />
          ))}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6">
          <p className="text-sm text-error-ink">{errorMessage ?? 'Error al consultar stock bajo.'}</p>
          {onRetry ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-primary hover:text-primary-hover"
              onClick={onRetry}
            >
              Reintentar
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ul className="mt-5 flex flex-col gap-4">
          {items.slice(0, 6).map((item) => {
            const ratio = item.minimum === 0 ? 0 : Math.min(item.stock / item.minimum, 1)
            const critical = ratio <= 0.3

            return (
              <li key={item.productoId}>
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to={`/inventario/${item.productoId}`}
                      className="truncate text-sm font-medium text-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted">{item.sku}</p>
                  </div>
                  <p className="shrink-0 text-sm text-muted tabular-nums">
                    <span
                      className={cn(
                        'font-semibold',
                        critical ? 'text-error-ink' : 'text-warning-ink',
                      )}
                    >
                      {item.stock}
                    </span>
                    <span> / {item.minimum}</span>
                  </p>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted"
                  role="meter"
                  aria-valuenow={item.stock}
                  aria-valuemin={0}
                  aria-valuemax={item.minimum}
                  aria-label={`Stock de ${item.name}`}
                >
                  <div
                    className={cn('h-full rounded-full', critical ? 'bg-error' : 'bg-warning')}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
    </Card>
  )
}
