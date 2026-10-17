import { useMemo } from 'react'
import { Link } from 'react-router'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, Trash2, Wallet } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { buttonVariants } from '@/components/ui/button-variants'
import { useActiveCashRegister } from '@/features/cash-register/hooks/use-cash-register'
import { SaleProductPicker } from '@/features/sales/components/SaleProductPicker'
import {
  emptySaleFormValues,
  estimateItemSubtotal,
  estimateSaleTotal,
  saleFormSchema,
  type SaleFormValues,
} from '@/features/sales/schemas/sale-schema'
import type { Producto } from '@/features/products/types'
import { PAYMENT_METHODS, paymentMethodLabel } from '@/features/sales/utils/sale-labels'
import { getApiErrorMessage, getUncertainMutationHint, normalizeApiError } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatMoney } from '@/lib/utils/format'

type SaleFormProps = {
  submitting?: boolean
  onSubmit: (values: SaleFormValues) => Promise<void>
  onCancel: () => void
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-[#c5d0c8] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

export function SaleForm({
  submitting = false,
  onSubmit,
  onCancel,
}: SaleFormProps) {
  const activeCashQuery = useActiveCashRegister()
  const hasOpenCash = activeCashQuery.data?.estado === 'ABIERTA'

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: emptySaleFormValues,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = useWatch({ control, name: 'items' })
  const metodoPago = useWatch({ control, name: 'metodoPago' })
  const items = useMemo(() => watchedItems ?? [], [watchedItems])
  const excludedProductIds = useMemo(
    () => items.map((item) => item.productoId),
    [items],
  )

  const estimate = estimateSaleTotal(items)
  const unitsTotal = items.reduce((sum, item) => {
    const qty = /^\d+$/.test(item.cantidad?.trim() ?? '') ? Number(item.cantidad) : 0
    return sum + qty
  }, 0)

  const needsCash = metodoPago === 'EFECTIVO'
  const cashBlocked = needsCash && !activeCashQuery.isLoading && !hasOpenCash
  const busy = submitting || isSubmitting

  function handleAddProduct(product: Producto, stockDisponible: number | null) {
    if (excludedProductIds.includes(product.id)) return
    append({
      productoId: product.id,
      nombre: product.nombre,
      codigo: product.codigo,
      precioVentaRef: product.precioVenta,
      stockDisponible,
      cantidad: '1',
    })
  }

  const submit = handleSubmit(async (values) => {
    if (busy) return
    if (values.metodoPago === 'EFECTIVO' && !hasOpenCash) {
      setError('root', {
        message: 'Para cobrar en efectivo necesitás una caja abierta.',
      })
      void activeCashQuery.refetch()
      return
    }
    try {
      await onSubmit(values)
    } catch (error) {
      const message = getApiErrorMessage(error)
      const hint = getUncertainMutationHint(error)
      setError('root', {
        message: hint ? `${message} ${hint}` : message,
      })
      const apiError = normalizeApiError(error)
      if (apiError.code === 'CJ02' || apiError.isNetworkError) {
        void activeCashQuery.refetch()
      }
    }
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight">Pago y caja</h3>
        <p className="mt-1 text-sm text-muted">
          El total definitivo lo calcula el servidor con los precios de venta actuales.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex w-full flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              Método de pago <span className="text-error">*</span>
            </span>
            <select
              className={cn(selectClassName, errors.metodoPago && 'border-error')}
              disabled={busy}
              aria-invalid={errors.metodoPago ? true : undefined}
              {...register('metodoPago')}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {paymentMethodLabel(method)}
                </option>
              ))}
            </select>
            {errors.metodoPago?.message ? (
              <span className="text-xs text-error-ink" role="alert">
                {errors.metodoPago.message}
              </span>
            ) : null}
          </label>

          <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium text-foreground">Estado de caja</p>
            {activeCashQuery.isLoading ? (
              <p className="mt-1 text-muted">Consultando…</p>
            ) : hasOpenCash ? (
              <p className="mt-1 text-muted">
                Caja #{activeCashQuery.data?.id} abierta
                {activeCashQuery.data?.usuario?.nombre
                  ? ` · ${activeCashQuery.data.usuario.nombre}`
                  : ''}
              </p>
            ) : (
              <p className="mt-1 text-muted">No hay caja abierta.</p>
            )}
            {cashBlocked ? (
              <p className="mt-2 text-xs text-warning-ink">
                El cobro en efectivo requiere caja abierta.{' '}
                <Link to="/caja" className="underline underline-offset-2">
                  Ir a caja
                </Link>
              </p>
            ) : needsCash && hasOpenCash ? (
              <p className="mt-2 text-xs text-muted">
                Esta venta se registrará también como movimiento de caja.
              </p>
            ) : !needsCash ? (
              <p className="mt-2 text-xs text-muted">
                Este método de pago no requiere caja abierta.
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight">Productos</h3>
        <p className="mt-1 text-sm text-muted">
          Buscá y agregá productos. Cada uno puede figurar una sola vez.
        </p>
        <div className="mt-4">
          <SaleProductPicker
            excludedProductIds={excludedProductIds}
            disabled={busy}
            onAdd={handleAddProduct}
          />
        </div>

        {errors.items?.root?.message || errors.items?.message ? (
          <p className="mt-3 text-sm text-error-ink" role="alert">
            {errors.items.root?.message ?? errors.items.message}
          </p>
        ) : null}

        <div className="mt-5">
          {fields.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Sin productos"
              description="Agregá al menos un producto para registrar la venta."
              className="py-8"
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                <caption className="sr-only">Ítems de la venta</caption>
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Producto
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Stock
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Cantidad
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Precio ref.
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Subtotal est.
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium sm:px-4">
                      Quitar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const item = items[index]
                    const subtotal =
                      item != null
                        ? estimateItemSubtotal(item.cantidad, item.precioVentaRef)
                        : null
                    return (
                      <tr key={field.id} className="border-b border-border last:border-b-0">
                        <td className="px-3 py-3 align-top sm:px-4">
                          <input
                            type="hidden"
                            {...register(`items.${index}.productoId`, {
                              valueAsNumber: true,
                            })}
                          />
                          <input type="hidden" {...register(`items.${index}.nombre`)} />
                          <input type="hidden" {...register(`items.${index}.codigo`)} />
                          <input type="hidden" {...register(`items.${index}.precioVentaRef`)} />
                          <input
                            type="hidden"
                            {...register(`items.${index}.stockDisponible`, {
                              setValueAs: (value) => {
                                if (value === '' || value == null) return null
                                const parsed = Number(value)
                                return Number.isFinite(parsed) ? parsed : null
                              },
                            })}
                            defaultValue={
                              field.stockDisponible == null ? '' : String(field.stockDisponible)
                            }
                          />
                          <p className="font-medium">{field.nombre}</p>
                          <p className="mt-0.5 font-mono text-xs text-muted">{field.codigo}</p>
                        </td>
                        <td className="px-3 py-3 align-top tabular-nums text-muted sm:px-4">
                          <span className="inline-flex h-11 items-center">
                            {item?.stockDisponible == null ? '—' : item.stockDisponible}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top sm:px-4">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={item?.stockDisponible ?? undefined}
                            step={1}
                            disabled={busy}
                            className="min-w-[5.5rem]"
                            error={errors.items?.[index]?.cantidad?.message}
                            {...register(`items.${index}.cantidad`)}
                          />
                        </td>
                        <td className="px-3 py-3 align-top whitespace-nowrap tabular-nums sm:px-4">
                          <span className="inline-flex h-11 items-center">
                            {formatMoney(field.precioVentaRef)}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top whitespace-nowrap tabular-nums font-medium sm:px-4">
                          <span className="inline-flex h-11 items-center">
                            {subtotal != null ? formatMoney(subtotal) : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top sm:px-4">
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9 text-muted hover:text-error-ink"
                              disabled={busy}
                              aria-label={`Quitar ${field.nombre}`}
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight">Resumen estimado</h3>
        <p className="mt-1 text-sm text-muted">
          Referencia con precios de catálogo. El total definitivo lo define el servidor.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <dt className="text-xs tracking-wide text-muted uppercase">Productos</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{items.length}</dd>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <dt className="text-xs tracking-wide text-muted uppercase">Unidades</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{unitsTotal}</dd>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <dt className="text-xs tracking-wide text-muted uppercase">Total estimado</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
              {estimate.complete && items.length > 0 ? formatMoney(estimate.total) : '—'}
            </dd>
          </div>
        </dl>

        {errors.root?.message ? (
          <p className="mt-4 text-sm text-error-ink" role="alert">
            {errors.root.message}
          </p>
        ) : null}

        {cashBlocked ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning-ink">
            <Wallet className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div>
              <p className="font-medium">Caja cerrada</p>
              <p className="mt-0.5">
                Abrí una caja antes de registrar una venta en efectivo.{' '}
                <Link
                  to="/caja"
                  className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-auto px-0')}
                >
                  Ir a caja
                </Link>
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy || cashBlocked}>
            {busy ? 'Registrando…' : 'Confirmar venta'}
          </Button>
        </div>
      </Card>
    </form>
  )
}
