import { useMemo } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PurchaseProductPicker } from '@/features/purchases/components/PurchaseProductPicker'
import {
  emptyPurchaseFormValues,
  estimateItemSubtotal,
  estimatePurchaseTotal,
  formatMoneyInput,
  purchaseFormSchema,
  type PurchaseFormValues,
} from '@/features/purchases/schemas/purchase-schema'
import type { Producto } from '@/features/products/types'
import { useSupplierOptions } from '@/features/suppliers/hooks/use-supplier-options'
import type { Proveedor } from '@/features/suppliers/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatMoney } from '@/lib/utils/format'

type PurchaseFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: PurchaseFormValues
  /** Proveedor actual al editar (aunque esté inactivo). */
  currentSupplier?: Proveedor | null
  submitting?: boolean
  onSubmit: (values: PurchaseFormValues) => Promise<void>
  onCancel: () => void
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-[#c5d0c8] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

export function PurchaseForm({
  mode,
  defaultValues = emptyPurchaseFormValues,
  currentSupplier = null,
  submitting = false,
  onSubmit,
  onCancel,
}: PurchaseFormProps) {
  const suppliersQuery = useSupplierOptions({ activo: true })

  const suppliers = useMemo(() => {
    const activeSuppliers = suppliersQuery.data ?? []
    if (!currentSupplier) return activeSuppliers
    if (activeSuppliers.some((supplier) => supplier.id === currentSupplier.id)) {
      return activeSuppliers
    }
    return [currentSupplier, ...activeSuppliers]
  }, [suppliersQuery.data, currentSupplier])

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = useWatch({ control, name: 'items' })
  const items = useMemo(() => watchedItems ?? [], [watchedItems])
  const excludedProductIds = useMemo(
    () => items.map((item) => item.productoId),
    [items],
  )

  const estimate = estimatePurchaseTotal(items)
  const distinctCount = items.length
  const unitsTotal = items.reduce((sum, item) => {
    const qty = /^\d+$/.test(item.cantidad?.trim() ?? '') ? Number(item.cantidad) : 0
    return sum + qty
  }, 0)

  const busy = submitting || isSubmitting
  const currentInactive =
    currentSupplier != null && currentSupplier.activo === false

  function handleAddProduct(product: Producto) {
    if (excludedProductIds.includes(product.id)) return
    append({
      productoId: product.id,
      nombre: product.nombre,
      codigo: product.codigo,
      cantidad: '1',
      costoUnitario: formatMoneyInput(product.precioCosto),
    })
  }

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  return (
    <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight">Información general</h3>
        <p className="mt-1 text-sm text-muted">
          La compra se guarda como borrador. El stock no cambia hasta confirmarla.
        </p>
        <div className="mt-4">
          <label className="flex w-full flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              Proveedor <span className="text-error">*</span>
            </span>
            <select
              className={cn(selectClassName, errors.proveedorId && 'border-error')}
              disabled={busy || suppliersQuery.isLoading}
              aria-invalid={errors.proveedorId ? true : undefined}
              {...register('proveedorId')}
            >
              <option value="">
                {suppliersQuery.isLoading
                  ? 'Cargando proveedores…'
                  : 'Seleccioná un proveedor'}
              </option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={String(supplier.id)}>
                  {supplier.nombre}
                  {!supplier.activo ? ' (inactivo)' : ''}
                </option>
              ))}
            </select>
            {errors.proveedorId?.message ? (
              <span className="text-xs text-error-ink" role="alert">
                {errors.proveedorId.message}
              </span>
            ) : currentInactive ? (
              <span className="text-xs text-warning-ink">
                El proveedor actual está inactivo. Para guardar, elegí uno activo.
              </span>
            ) : suppliersQuery.isError ? (
              <span className="text-xs text-error-ink" role="alert">
                No se pudieron cargar los proveedores.
              </span>
            ) : (
              <span className="text-xs text-muted">Solo se listan proveedores activos.</span>
            )}
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight">Productos de la compra</h3>
        <p className="mt-1 text-sm text-muted">
          Buscá y agregá productos. Cada uno puede figurar una sola vez.
        </p>
        <div className="mt-4">
          <PurchaseProductPicker
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
              description="Agregá al menos un producto para guardar el borrador."
              className="py-8"
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                <caption className="sr-only">Ítems de la compra</caption>
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Producto
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Cantidad
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Costo unitario
                    </th>
                    <th scope="col" className="px-3 py-2.5 font-medium sm:px-4">
                      Subtotal
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
                        ? estimateItemSubtotal(item.cantidad, item.costoUnitario)
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
                          <p className="font-medium">{field.nombre}</p>
                          <p className="mt-0.5 font-mono text-xs text-muted">{field.codigo}</p>
                          {errors.items?.[index]?.productoId?.message ? (
                            <p className="mt-1 text-xs text-error-ink" role="alert">
                              {errors.items[index].productoId.message}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 align-top sm:px-4">
                          <Input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            disabled={busy}
                            className="min-w-[5.5rem]"
                            error={errors.items?.[index]?.cantidad?.message}
                            {...register(`items.${index}.cantidad`)}
                          />
                        </td>
                        <td className="px-3 py-3 align-top sm:px-4">
                          <Input
                            type="text"
                            inputMode="decimal"
                            disabled={busy}
                            className="min-w-[7rem]"
                            error={errors.items?.[index]?.costoUnitario?.message}
                            {...register(`items.${index}.costoUnitario`)}
                          />
                        </td>
                        <td className="px-3 py-3 align-top whitespace-nowrap tabular-nums sm:px-4">
                          <span className="inline-flex h-11 items-center text-sm font-medium">
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
          Cálculo orientativo. El total definitivo lo define el servidor al guardar.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <dt className="text-xs tracking-wide text-muted uppercase">Productos</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{distinctCount}</dd>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <dt className="text-xs tracking-wide text-muted uppercase">Unidades</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{unitsTotal}</dd>
          </div>
          <div className="rounded-xl bg-surface-muted px-4 py-3">
            <dt className="text-xs tracking-wide text-muted uppercase">Total estimado</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums tracking-tight">
              {estimate.complete && distinctCount > 0 ? formatMoney(estimate.total) : '—'}
            </dd>
          </div>
        </dl>

        {errors.root?.message ? (
          <p className="mt-4 text-sm text-error-ink" role="alert">
            {errors.root.message}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy
              ? 'Guardando…'
              : mode === 'create'
                ? 'Guardar borrador'
                : 'Actualizar borrador'}
          </Button>
        </div>
      </Card>
    </form>
  )
}
