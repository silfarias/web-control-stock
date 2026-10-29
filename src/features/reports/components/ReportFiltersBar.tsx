import { useEffect, useState, type ReactNode } from 'react'
import { useCategoryOptions } from '@/features/categories/hooks/use-category-options'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils/cn'

export type ReportFilterValues = {
  fecha?: string
  desde?: string
  hasta?: string
  categoriaId?: number
  codigo?: string
  limite?: number
}

type ReportFiltersBarProps = {
  values: ReportFilterValues
  onChange: (next: ReportFilterValues) => void
  onClear: () => void
  showDates?: boolean
  showLimite?: boolean
  productHint?: string
  className?: string
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground transition-colors',
  'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
)

const dateClassName = 'w-full min-w-0 px-2.5'

function Field({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('shrink-0', className)}>
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </div>
  )
}

export function ReportFiltersBar({
  values,
  onChange,
  onClear,
  showDates = false,
  showLimite = false,
  productHint,
  className,
}: ReportFiltersBarProps) {
  const categoriesQuery = useCategoryOptions()
  const categories = categoriesQuery.data ?? []
  const externalCodigo = values.codigo ?? ''
  const [codigoInput, setCodigoInput] = useState(externalCodigo)
  const [seenCodigo, setSeenCodigo] = useState(externalCodigo)

  if (externalCodigo !== seenCodigo) {
    setSeenCodigo(externalCodigo)
    setCodigoInput(externalCodigo)
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const next = codigoInput.trim()
      if (next === (values.codigo ?? '')) return
      onChange({ ...values, codigo: next || undefined })
    }, 300)
    return () => window.clearTimeout(timeoutId)
  }, [codigoInput, onChange, values])

  const hasFilters =
    Boolean(values.fecha) ||
    Boolean(values.desde) ||
    Boolean(values.hasta) ||
    values.categoriaId != null ||
    Boolean(codigoInput.trim()) ||
    (showLimite && values.limite != null && values.limite !== 10)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-nowrap items-end gap-2.5 overflow-x-auto">
        {showDates ? (
          <>
            <Field label="Fecha" className="w-[10.75rem]">
              <Input
                type="date"
                aria-label="Fecha"
                className={dateClassName}
                value={values.fecha ?? ''}
                onChange={(event) =>
                  onChange({ ...values, fecha: event.target.value || undefined })
                }
              />
            </Field>
            <Field label="Desde" className="w-[10.75rem]">
              <Input
                type="date"
                aria-label="Desde"
                className={cn(dateClassName, 'disabled:cursor-not-allowed disabled:opacity-60')}
                value={values.desde ?? ''}
                disabled={Boolean(values.fecha)}
                onChange={(event) =>
                  onChange({ ...values, desde: event.target.value || undefined })
                }
              />
            </Field>
            <Field label="Hasta" className="w-[10.75rem]">
              <Input
                type="date"
                aria-label="Hasta"
                className={cn(dateClassName, 'disabled:cursor-not-allowed disabled:opacity-60')}
                value={values.hasta ?? ''}
                disabled={Boolean(values.fecha)}
                onChange={(event) =>
                  onChange({ ...values, hasta: event.target.value || undefined })
                }
              />
            </Field>
          </>
        ) : null}

        <Field label="Categoría" className="w-44">
          <select
            className={selectClassName}
            aria-label="Categoría"
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
        </Field>

        <Field label="Código" className="w-40">
          <Input
            type="search"
            aria-label="Código de producto"
            placeholder="ELE-004"
            value={codigoInput}
            onChange={(event) => setCodigoInput(event.target.value)}
          />
        </Field>

        {showLimite ? (
          <Field label="Límite" className="w-[4.75rem]">
            <Input
              type="number"
              aria-label="Límite"
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
          </Field>
        ) : null}

        {hasFilters ? (
          <Button type="button" variant="outline" className="h-11 shrink-0" onClick={onClear}>
            Limpiar
          </Button>
        ) : null}
      </div>

      {showDates && values.fecha ? (
        <p className="text-xs text-muted">
          Se consulta ese día. Si borrás la fecha, vuelve a usarse el rango.
        </p>
      ) : null}

      {productHint ? <p className="text-xs text-muted">{productHint}</p> : null}
    </div>
  )
}
