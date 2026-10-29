import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Barcode, Package, Trash2, Wallet } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useActiveCashRegister } from '@/features/cash-register/hooks/use-cash-register'
import { inventoryApi } from '@/features/inventory/api/inventory-api'
import { productsApi } from '@/features/products/api/products-api'
import type { Producto } from '@/features/products/types'
import {
  emptySaleFormValues,
  estimateItemSubtotal,
  estimateSaleTotal,
  saleFormSchema,
  type SaleFormValues,
} from '@/features/sales/schemas/sale-schema'
import { PAYMENT_METHODS, paymentMethodLabel } from '@/features/sales/utils/sale-labels'
import { getApiErrorMessage, getUncertainMutationHint, normalizeApiError } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatComprobante, formatMoney } from '@/lib/utils/format'
import { isValidMoneyInput, parseMoneyInput } from '@/lib/utils/money-input'

export type SaleCheckout = {
  cashReceived?: number
}

type SaleFormProps = {
  submitting?: boolean
  onSubmit: (values: SaleFormValues, checkout?: SaleCheckout) => Promise<void>
  onCancel: () => void
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

export function SaleForm({
  submitting = false,
  onSubmit,
  onCancel,
}: SaleFormProps) {
  const activeCashQuery = useActiveCashRegister()
  const hasOpenCash = activeCashQuery.data?.estado === 'ABIERTA'
  const codeRef = useRef<HTMLInputElement>(null)
  const [code, setCode] = useState('')
  const [scanQty, setScanQty] = useState('1')
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [lookingUp, setLookingUp] = useState(false)
  const [cashReceived, setCashReceived] = useState('')

  const {
    control,
    register,
    handleSubmit,
    setError,
    setValue,
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

  const estimate = estimateSaleTotal(items)
  const unitsTotal = items.reduce((sum, item) => {
    const qty = /^\d+$/.test(item.cantidad?.trim() ?? '') ? Number(item.cantidad) : 0
    return sum + qty
  }, 0)

  const needsCash = metodoPago === 'EFECTIVO'
  const cashBlocked = needsCash && !activeCashQuery.isLoading && !hasOpenCash
  const receivedAmount =
    needsCash && isValidMoneyInput(cashReceived) ? parseMoneyInput(cashReceived) : null
  const canQuoteChange = receivedAmount != null && items.length > 0 && estimate.complete
  const changeAmount = canQuoteChange
    ? Number((receivedAmount - estimate.total).toFixed(2))
    : null
  const busy = submitting || isSubmitting || lookingUp
  const totalLabel =
    estimate.complete && items.length > 0 ? formatMoney(estimate.total) : formatMoney(0)

  async function addByCode() {
    const trimmed = code.trim()
    if (!trimmed || lookingUp || submitting || isSubmitting) return

    const addQty = /^\d+$/.test(scanQty.trim()) ? Number(scanQty) : 0
    if (addQty < 1) {
      setLookupError('La cantidad debe ser al menos 1.')
      return
    }

    setLookingUp(true)
    setLookupError(null)
    try {
      const product = await findProductByCode(trimmed)
      if (!product) {
        setLookupError('No encontramos un producto con ese código.')
        return
      }

      const stock = await fetchStockQuantity(product.id)
      if (stock == null || stock < 1) {
        setLookupError('Ese producto no tiene stock disponible.')
        return
      }

      const existingIndex = items.findIndex((item) => item.productoId === product.id)
      const currentQty =
        existingIndex >= 0 && /^\d+$/.test(items[existingIndex]?.cantidad?.trim() ?? '')
          ? Number(items[existingIndex].cantidad)
          : 0
      const nextQty = currentQty + addQty
      if (nextQty > stock) {
        setLookupError(`Stock disponible: ${stock}.`)
        return
      }

      if (existingIndex >= 0) {
        setValue(`items.${existingIndex}.cantidad`, String(nextQty), {
          shouldValidate: true,
          shouldDirty: true,
        })
      } else {
        append({
          productoId: product.id,
          nombre: product.nombre,
          codigo: product.codigo,
          precioVentaRef: product.precioVenta,
          stockDisponible: stock,
          cantidad: String(addQty),
        })
      }

      setCode('')
      setScanQty('1')
      codeRef.current?.focus()
    } catch (error) {
      setLookupError(getApiErrorMessage(error))
    } finally {
      setLookingUp(false)
    }
  }

  function handleScanKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    void addByCode()
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
      const received =
        values.metodoPago === 'EFECTIVO' && isValidMoneyInput(cashReceived)
          ? parseMoneyInput(cashReceived)
          : undefined
      await onSubmit(
        values,
        received != null && Number.isFinite(received) ? { cashReceived: received } : undefined,
      )
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
    <form className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]" onSubmit={submit} noValidate>
      <Card className="min-w-0 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Input
              ref={codeRef}
              label="Código de barras"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={handleScanKeyDown}
              placeholder="Escaneá o escribí el código"
              leadingIcon={<Barcode className="size-4" aria-hidden />}
              autoFocus
              disabled={busy}
              autoComplete="off"
            />
          </div>
          <div className="w-full sm:w-28">
            <Input
              label="Cantidad"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={scanQty}
              onChange={(event) => setScanQty(event.target.value)}
              onKeyDown={handleScanKeyDown}
              disabled={busy}
            />
          </div>
          <Button type="button" className="h-11 shrink-0" disabled={busy} onClick={() => void addByCode()}>
            {lookingUp ? 'Buscando…' : 'Agregar'}
          </Button>
        </div>
        {lookupError ? (
          <p className="mt-2 text-sm text-error-ink" role="alert">
            {lookupError}
          </p>
        ) : null}

        {errors.items?.root?.message || errors.items?.message ? (
          <p className="mt-3 text-sm text-error-ink" role="alert">
            {errors.items.root?.message ?? errors.items.message}
          </p>
        ) : null}

        <div className="mt-4 min-w-0">
          {fields.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Todavía no hay productos"
              description="Escaneá un código o ingresalo arriba para sumarlo a la venta."
              className="py-10"
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <caption className="sr-only">Ítems de la venta</caption>
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Producto
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Stock
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Cant.
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Precio
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium">
                      Subtotal
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">
                      <span className="sr-only">Quitar</span>
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
                        <td className="px-3 py-3 align-top">
                          <input
                            type="hidden"
                            {...register(`items.${index}.productoId`, { valueAsNumber: true })}
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
                        <td className="px-3 py-3 align-top text-muted tabular-nums">
                          <span className="inline-flex h-11 items-center">
                            {item?.stockDisponible == null ? '—' : item.stockDisponible}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={item?.stockDisponible ?? undefined}
                            step={1}
                            disabled={busy}
                            className="min-w-[4.5rem]"
                            error={errors.items?.[index]?.cantidad?.message}
                            {...register(`items.${index}.cantidad`)}
                          />
                        </td>
                        <td className="px-3 py-3 align-top whitespace-nowrap tabular-nums">
                          <span className="inline-flex h-11 items-center">
                            {formatMoney(field.precioVentaRef)}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top font-medium whitespace-nowrap tabular-nums">
                          <span className="inline-flex h-11 items-center">
                            {subtotal != null ? formatMoney(subtotal) : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top">
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

      <Card className="overflow-hidden p-0 lg:sticky lg:top-4">
        <div className="bg-primary px-5 py-5 text-white">
          <p className="text-xs font-medium tracking-wide text-white/75 uppercase">Total estimado</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{totalLabel}</p>
          <p className="mt-2 text-sm text-white/80">
            {items.length} {items.length === 1 ? 'producto' : 'productos'} · {unitsTotal}{' '}
            {unitsTotal === 1 ? 'unidad' : 'unidades'}
          </p>
        </div>

        <div className="flex flex-col gap-4 p-5">
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

          {needsCash ? (
            <div className="flex flex-col gap-3">
              <MoneyInput
                label="Dinero recibido"
                prefix="$"
                value={cashReceived}
                disabled={busy}
                placeholder="0,00"
                onValueChange={(values) => setCashReceived(values.value)}
              />
              {changeAmount == null ? (
                <p className="text-xs text-muted">
                  Ingresá lo que entrega el cliente para calcular el vuelto.
                </p>
              ) : changeAmount < 0 ? (
                <p className="text-sm text-warning-ink" role="status">
                  Falta {formatMoney(Math.abs(changeAmount))} para cubrir el total.
                </p>
              ) : (
                <div className="rounded-xl border border-border bg-surface-muted px-4 py-3" role="status">
                  <p className="text-xs font-medium tracking-wide text-muted uppercase">Vuelto</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                    {formatMoney(changeAmount)}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
            <p className="font-medium text-foreground">Estado de caja</p>
            {activeCashQuery.isLoading ? (
              <p className="mt-1 text-muted">Consultando…</p>
            ) : hasOpenCash ? (
              <p className="mt-1 text-muted">
                Caja {formatComprobante(activeCashQuery.data?.numero)} abierta
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
              <p className="mt-2 text-xs text-muted">Se registra también como movimiento de caja.</p>
            ) : !needsCash ? (
              <p className="mt-2 text-xs text-muted">Este método no requiere caja abierta.</p>
            ) : null}
          </div>

          {errors.root?.message ? (
            <p className="text-sm text-error-ink" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          {cashBlocked ? (
            <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning-ink">
              <Wallet className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>Abrí una caja antes de registrar una venta en efectivo.</p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button type="submit" className="h-11 w-full" disabled={busy || cashBlocked}>
              {submitting || isSubmitting ? 'Registrando…' : 'Confirmar venta'}
            </Button>
            <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    </form>
  )
}

async function findProductByCode(code: string): Promise<Producto | null> {
  const byBarcode = await productsApi.search({
    codigoBarras: code,
    pageNumber: 1,
    pageSize: 5,
  })
  const exactBarcode =
    byBarcode.data.find((product) => product.codigoBarras === code) ??
    (byBarcode.data.length === 1 ? byBarcode.data[0] : undefined)
  if (exactBarcode) return exactBarcode

  const byCode = await productsApi.search({
    codigo: code,
    pageNumber: 1,
    pageSize: 5,
  })
  return (
    byCode.data.find((product) => product.codigo === code) ??
    (byCode.data.length === 1 ? byCode.data[0] : null)
  )
}

async function fetchStockQuantity(productoId: number): Promise<number | null> {
  try {
    const stock = await inventoryApi.getByProductId(productoId)
    return stock.cantidad
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}
