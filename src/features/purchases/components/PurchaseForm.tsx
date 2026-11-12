import { useMemo, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Package, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { QuantityInput } from '@/components/ui/QuantityInput'
import { useQuantityHotkeys } from '@/hooks/use-quantity-hotkeys'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { PurchaseProductPicker } from '@/features/purchases/components/PurchaseProductPicker'
import {
  emptyPurchaseFormValues,
  estimateItemSubtotal,
  estimatePurchaseTotal,
  formatMoneyInput,
  purchaseFormSchema,
  type PurchaseFormValues,
} from '@/features/purchases/schemas/purchase-schema'
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog'
import { useCreateProduct } from '@/features/products/hooks/use-product-mutations'
import {
  toCreateProductoFromPurchaseQuick,
  type PurchaseProductQuickFormValues,
} from '@/features/products/schemas/product-schema'
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

export function PurchaseForm({
  mode,
  defaultValues = emptyPurchaseFormValues,
  currentSupplier = null,
  submitting = false,
  onSubmit,
  onCancel,
}: PurchaseFormProps) {
  const { pushToast } = useToast()
  const createProductMutation = useCreateProduct()
  const formRef = useRef<HTMLFormElement>(null)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [productInitialNombre, setProductInitialNombre] = useState('')
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)

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
    setValue,
    getValues,
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

  useQuantityHotkeys({
    enabled: !busy && !productDialogOpen,
    itemCount: fields.length,
    selectedIndex: selectedItemIndex,
    formRef,
    getQuantity: (index) => getValues(`items.${index}.cantidad`) ?? '1',
    setQuantity: (index, value) =>
      setValue(`items.${index}.cantidad`, value, {
        shouldDirty: true,
        shouldValidate: true,
      }),
  })

  function handleAddProduct(product: Producto) {
    if (excludedProductIds.includes(product.id)) return
    append({
      productoId: product.id,
      nombre: product.nombre,
      codigo: product.codigo,
      cantidad: '1',
      costoUnitario: formatMoneyInput(product.precioCosto ?? 0),
    })
    setSelectedItemIndex(fields.length)
  }

  function handleRemoveItem(index: number) {
    remove(index)
    setSelectedItemIndex((current) => {
      if (current == null) return null
      if (current === index) return null
      if (current > index) return current - 1
      return current
    })
  }

  function openCreateProduct(initialNombre?: string) {
    setProductInitialNombre(initialNombre?.trim() ?? '')
    setProductDialogOpen(true)
  }

  async function handleCreateProduct(values: PurchaseProductQuickFormValues) {
    const product = await createProductMutation.mutateAsync(
      toCreateProductoFromPurchaseQuick(values),
    )
    handleAddProduct(product)
    pushToast({
      tone: 'success',
      title: 'Producto creado',
      description: `"${product.nombre}" se agregó al catálogo y a la compra.`,
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
    <>
      <form ref={formRef} className="flex flex-col gap-5" onSubmit={submit} noValidate>
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          {/* Izquierda: proveedor + ítems */}
          <div className="flex min-w-0 flex-col gap-5">
            <Card className="p-5">
              <h3 className="text-sm font-semibold tracking-tight">Proveedor</h3>
              <p className="mt-1 text-sm text-muted">
                La compra se guarda como borrador. El stock no cambia hasta confirmarla.
              </p>
              <div className="mt-4">
                <div className="flex w-full flex-col gap-1.5 text-sm">
                  <span className="font-medium text-foreground">
                    Proveedor <span className="text-error">*</span>
                  </span>
                  <Controller
                    name="proveedorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={busy || suppliersQuery.isLoading}
                      >
                        <SelectTrigger
                          aria-invalid={errors.proveedorId ? true : undefined}
                          className={cn(errors.proveedorId && 'border-error')}
                        >
                          <SelectValue
                            placeholder={
                              suppliersQuery.isLoading
                                ? 'Cargando proveedores…'
                                : 'Seleccioná un proveedor'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={String(supplier.id)}>
                              {supplier.nombre}
                              {!supplier.activo ? ' (inactivo)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
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
                </div>
              </div>
            </Card>

            <Card className="flex min-h-0 flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">Productos de la compra</h3>
                  <p className="mt-1 text-sm text-muted">
                    Ajustá cantidades y costos de lo que ya agregaste.
                  </p>
                </div>
                {fields.length > 0 ? (
                  <span className="shrink-0 rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-medium tabular-nums text-muted">
                    {fields.length}
                  </span>
                ) : null}
              </div>

              {errors.items?.root?.message || errors.items?.message ? (
                <p className="mt-3 text-sm text-error-ink" role="alert">
                  {errors.items.root?.message ?? errors.items.message}
                </p>
              ) : null}

              <div className="mt-4 min-w-0">
                {fields.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="Sin productos"
                    description="Elegí productos del catálogo a la derecha o creá uno nuevo."
                    className="py-8"
                  />
                ) : (
                  <div className="rounded-xl border border-border">
                    <Table className="min-w-[28rem]">
                      <TableCaption className="sr-only">Ítems de la compra</TableCaption>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="px-3 sm:px-3">Producto</TableHead>
                          <TableHead className="px-3 sm:px-3">Cant.</TableHead>
                          <TableHead className="px-3 sm:px-3">Costo</TableHead>
                          <TableHead className="px-3 sm:px-3">Subtotal</TableHead>
                          <TableHead className="px-3 text-right sm:px-3">
                            <span className="sr-only">Quitar</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => {
                          const item = items[index]
                          const subtotal =
                            item != null
                              ? estimateItemSubtotal(item.cantidad, item.costoUnitario)
                              : null
                          return (
                            <TableRow
                              key={field.id}
                              className={cn(
                                'hover:bg-transparent',
                                selectedItemIndex === index && 'bg-primary/5',
                              )}
                              onClick={() => setSelectedItemIndex(index)}
                            >
                              <TableCell className="px-3 align-top sm:px-3">
                                <input
                                  type="hidden"
                                  {...register(`items.${index}.productoId`, {
                                    valueAsNumber: true,
                                  })}
                                />
                                <input type="hidden" {...register(`items.${index}.nombre`)} />
                                <input type="hidden" {...register(`items.${index}.codigo`)} />
                                <p className="font-medium">{field.nombre}</p>
                                <p className="mt-0.5 font-mono text-xs text-muted">
                                  {field.codigo}
                                </p>
                                {errors.items?.[index]?.productoId?.message ? (
                                  <p className="mt-1 text-xs text-error-ink" role="alert">
                                    {errors.items[index].productoId.message}
                                  </p>
                                ) : null}
                              </TableCell>
                              <TableCell className="px-3 align-top sm:px-3">
                                <Controller
                                  name={`items.${index}.cantidad`}
                                  control={control}
                                  render={({ field: qtyField }) => (
                                    <QuantityInput
                                      disabled={busy}
                                      className="min-w-[4.5rem]"
                                      error={errors.items?.[index]?.cantidad?.message}
                                      aria-label={`Cantidad de ${field.nombre}`}
                                      name={qtyField.name}
                                      value={qtyField.value}
                                      ref={qtyField.ref}
                                      onBlur={qtyField.onBlur}
                                      onFocus={() => setSelectedItemIndex(index)}
                                      onChange={qtyField.onChange}
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell className="px-3 align-top sm:px-3">
                                <Controller
                                  name={`items.${index}.costoUnitario`}
                                  control={control}
                                  render={({ field: costField }) => (
                                    <MoneyInput
                                      disabled={busy}
                                      className="min-w-[5.5rem]"
                                      error={errors.items?.[index]?.costoUnitario?.message}
                                      name={costField.name}
                                      value={costField.value}
                                      onBlur={costField.onBlur}
                                      getInputRef={costField.ref}
                                      onValueChange={(values) => costField.onChange(values.value)}
                                    />
                                  )}
                                />
                              </TableCell>
                              <TableCell className="px-3 align-top whitespace-nowrap tabular-nums sm:px-3">
                                <span className="inline-flex h-11 items-center text-sm font-medium">
                                  {subtotal != null ? formatMoney(subtotal) : '—'}
                                </span>
                              </TableCell>
                              <TableCell className="px-3 align-top sm:px-3">
                                <div className="flex justify-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-9 text-muted hover:text-error-ink"
                                    disabled={busy}
                                    aria-label={`Quitar ${field.nombre}`}
                                    onClick={() => handleRemoveItem(index)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Derecha: catálogo */}
          <Card className="min-w-0 p-5 lg:sticky lg:top-4 lg:self-start">
            <h3 className="text-sm font-semibold tracking-tight">Catálogo de productos</h3>
            <p className="mt-1 text-sm text-muted">
              Buscá y agregá. Si es una adquisición nueva, crealo al instante.
            </p>
            <div className="mt-4">
              <PurchaseProductPicker
                excludedProductIds={excludedProductIds}
                disabled={busy}
                onAdd={handleAddProduct}
                onCreateProduct={openCreateProduct}
              />
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="text-sm font-semibold tracking-tight">Resumen estimado</h3>
          <p className="mt-1 text-sm text-muted">
            Estimación orientativa. El total final se confirma al guardar.
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

      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        submitting={createProductMutation.isPending}
        initialNombre={productInitialNombre}
        onSubmit={handleCreateProduct}
      />
    </>
  )
}
