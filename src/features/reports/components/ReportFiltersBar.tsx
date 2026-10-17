import { useCategoryOptions } from '@/features/categories/hooks/use-category-options'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils/cn'

export type ReportFilterValues = {
  desde?: string
  hasta?: string
  categoriaId?: number
  productoId?: number
  limite?: number
}

type ReportFiltersBarProps = {
  values: ReportFilterValues
  onChange: (next: ReportFilterValues) => void
  onClear: () => void
  showDates?: boolean
  showLimite?: boolean
  className?: string
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
)

export function ReportFiltersBar({
  values,
  onChange,
  onClear,
  showDates = false,
  showLimite = false,
  className,
}: ReportFiltersBarProps) {
  const categoriesQuery = useCategoryOptions()
  const categories = categoriesQuery.data ?? []

  const hasFilters =
    Boolean(values.desde) ||
    Boolean(values.hasta) ||
    values.categoriaId != null ||
    values.productoId != null ||
    (showLimite && values.limite != null && values.limite !== 10)

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {showDates ? (
          <>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted">Desde</span>
              <Input
                type="date"
                value={values.desde ?? ''}
                onChange={(event) =>
                  onChange({ ...values, desde: event.target.value || undefined })
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted">Hasta</span>
              <Input
                type="date"
                value={values.hasta ?? ''}
                onChange={(event) =>
                  onChange({ ...values, hasta: event.target.value || undefined })
                }
              />
            </label>
          </>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted">Categoría</span>
          <select
            className={selectClassName}
            value={values.categoriaId ?? ''}
            onChange={(event) => {
              const raw = event.target.value
              onChange({
                ...values,
                categoriaId: raw ? Number(raw) : undefined,
              })
            }}
            disabled={categoriesQuery.isLoading}
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted">ID de producto</span>
          <Input
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="Opcional"
            value={values.productoId ?? ''}
            onChange={(event) => {
              const raw = event.target.value.trim()
              if (!raw) {
                onChange({ ...values, productoId: undefined })
                return
              }
              const parsed = Number(raw)
              onChange({
                ...values,
                productoId: Number.isInteger(parsed) && parsed >= 1 ? parsed : values.productoId,
              })
            }}
          />
        </label>

        {showLimite ? (
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-muted">Límite (top)</span>
            <Input
              type="number"
              min={1}
              max={100}
              inputMode="numeric"
              value={values.limite ?? 10}
              onChange={(event) => {
                const parsed = Number(event.target.value)
                if (!Number.isInteger(parsed) || parsed < 1) return
                onChange({ ...values, limite: Math.min(parsed, 100) })
              }}
            />
          </label>
        ) : null}
      </div>

      {hasFilters ? (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={onClear}>
            Limpiar filtros
          </Button>
        </div>
      ) : null}
    </div>
  )
}
