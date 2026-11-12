import { useMemo, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRightLeft, Package, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
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
import { Textarea } from '@/components/ui/Textarea'
import { useAllSucursales } from '@/features/sucursales/hooks/use-sucursales'
import type { Sucursal } from '@/features/sucursales/types'
import { TransferProductPicker } from '@/features/transfers/components/TransferProductPicker'
import { useOriginProductStocks } from '@/features/transfers/hooks/use-origin-stocks'
import {
  emptyTransferFormValues,
  transferFormSchema,
  type TransferFormValues,
} from '@/features/transfers/schemas/transfer-schema'
import type { Producto } from '@/features/products/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

type TransferFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: TransferFormValues
  submitting?: boolean
  onSubmit: (values: TransferFormValues) => Promise<void>
  onCancel: () => void
}

export function TransferForm({
  mode,
  defaultValues = emptyTransferFormValues,
  submitting = false,
  onSubmit,
  onCancel,
}: TransferFormProps) {
  const sucursalesQuery = useAllSucursales()
  const sucursales = useMemo(() => {
    const list = sucursalesQuery.data ?? []
    return list.filter((item) => item.activo)
  }, [sucursalesQuery.data])

  const formRef = useRef<HTMLFormElement>(null)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferFormSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const watchedItems = useWatch({ control, name: 'items' })
  const watchedOrigen = useWatch({ control, name: 'sucursalOrigenId' })
  const watchedDestino = useWatch({ control, name: 'sucursalDestinoId' })

  const items = useMemo(() => watchedItems ?? [], [watchedItems])
  const sucursalOrigenId =
    watchedOrigen && /^\d+$/.test(watchedOrigen) ? Number(watchedOrigen) : null

  const excludedProductIds = useMemo(
    () => items.map((item) => item.productoId),
    [items],
  )

  const stocksQuery = useOriginProductStocks(
    sucursalOrigenId,
    items.map((item) => item.productoId),
  )
  const stocks = stocksQuery.data ?? {}

  const busy = submitting || isSubmitting
  const unitsTotal = items.reduce((sum, item) => {
    const qty = /^\d+$/.test(item.cantidad?.trim() ?? '') ? Number(item.cantidad) : 0
    return sum + qty
  }, 0)

  useQuantityHotkeys({
    enabled: !busy,
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

  function handleOrigenChange(value: string, onChange: (value: string) => void) {
    onChange(value)
    if (value && value === watchedDestino) {
      setValue('sucursalDestinoId', '', { shouldValidate: true })
    }
  }

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  return (
    <form ref={formRef} className="flex flex-col gap-5" onSubmit={submit} noValidate>
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight">Sucursales</h3>
            <p className="mt-1 text-sm text-muted">
              El stock sale del origen y entra en el destino al confirmar. En borrador no se
              mueve inventario.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex w-full flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">
                  Origen <span className="text-error">*</span>
                </span>
                <Controller
                  name="sucursalOrigenId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => handleOrigenChange(value, field.onChange)}
                      disabled={busy || sucursalesQuery.isLoading}
                    >
                      <SelectTrigger
                        aria-invalid={errors.sucursalOrigenId ? true : undefined}
                        className={cn(errors.sucursalOrigenId && 'border-error')}
                      >
                        <SelectValue
                          placeholder={
                            sucursalesQuery.isLoading
                              ? 'Cargando…'
                              : 'Sucursal de origen'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {sucursales.map((sucursal) => (
                          <SelectItem key={sucursal.id} value={String(sucursal.id)}>
                            {labelSucursal(sucursal)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sucursalOrigenId?.message ? (
                  <p className="text-xs text-error-ink">{errors.sucursalOrigenId.message}</p>
                ) : null}
              </div>

              <div className="flex w-full flex-col gap-1.5 text-sm">
                <span className="font-medium text-foreground">
                  Destino <span className="text-error">*</span>
                </span>
                <Controller
                  name="sucursalDestinoId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={busy || sucursalesQuery.isLoading}
                    >
                      <SelectTrigger
                        aria-invalid={errors.sucursalDestinoId ? true : undefined}
                        className={cn(errors.sucursalDestinoId && 'border-error')}
                      >
                        <SelectValue placeholder="Sucursal de destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {sucursales
                          .filter((item) => String(item.id) !== watchedOrigen)
                          .map((sucursal) => (
                            <SelectItem key={sucursal.id} value={String(sucursal.id)}>
                              {labelSucursal(sucursal)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.sucursalDestinoId?.message ? (
                  <p className="text-xs text-error-ink">{errors.sucursalDestinoId.message}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-4">
              <Textarea
                label="Observación"
                rows={2}
                disabled={busy}
                error={errors.observacion?.message}
                hint="Opcional."
                {...register('observacion')}
              />
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold tracking-tight">Productos a transferir</h3>
              <p className="mt-1 text-sm text-muted">
                Cantidades enteras. El stock mostrado corresponde a la sucursal de origen.
              </p>
            </div>

            {fields.length === 0 ? (
              <div className="px-2 py-2">
                <EmptyState
                  icon={Package}
                  title="Sin productos"
                  description="Agregá productos desde el panel de la derecha."
                />
              </div>
            ) : (
              <Table className="min-w-[36rem]">
                <TableCaption className="sr-only">Ítems de la transferencia</TableCaption>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Producto</TableHead>
                    <TableHead>Stock origen</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const productoId = items[index]?.productoId
                    const stock =
                      productoId != null ? (stocks[productoId] ?? null) : null
                    const cantidadRaw = items[index]?.cantidad?.trim() ?? ''
                    const cantidad = /^\d+$/.test(cantidadRaw) ? Number(cantidadRaw) : null
                    const exceeds =
                      stock != null && cantidad != null && cantidad > stock

                    return (
                      <TableRow
                        key={field.id}
                        className={cn(
                          selectedItemIndex === index && 'bg-primary/5',
                        )}
                        onClick={() => setSelectedItemIndex(index)}
                      >
                        <TableCell>
                          <p className="font-medium">{items[index]?.nombre}</p>
                          <p className="mt-0.5 font-mono text-xs text-muted">
                            {items[index]?.codigo}
                          </p>
                          {errors.items?.[index]?.productoId?.message ? (
                            <p className="mt-1 text-xs text-error-ink">
                              {errors.items[index]?.productoId?.message}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="tabular-nums text-muted">
                          {stocksQuery.isFetching && stock == null ? '…' : (stock ?? '—')}
                        </TableCell>
                        <TableCell className="align-top">
                          <Controller
                            name={`items.${index}.cantidad`}
                            control={control}
                            render={({ field: qtyField }) => (
                              <QuantityInput
                                className="w-24"
                                disabled={busy}
                                error={errors.items?.[index]?.cantidad?.message}
                                aria-label={`Cantidad de ${items[index]?.nombre ?? 'producto'}`}
                                name={qtyField.name}
                                value={qtyField.value}
                                ref={qtyField.ref}
                                onBlur={qtyField.onBlur}
                                onFocus={() => setSelectedItemIndex(index)}
                                onChange={qtyField.onChange}
                              />
                            )}
                          />
                          {exceeds ? (
                            <p className="mt-1 text-xs text-warning-ink">
                              Supera el stock disponible
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="align-top">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 text-error-ink hover:bg-error-soft"
                            disabled={busy}
                            onClick={() => handleRemoveItem(index)}
                            aria-label={`Quitar ${items[index]?.nombre ?? 'producto'}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}

            {errors.items?.message || errors.items?.root?.message ? (
              <p className="border-t border-border px-5 py-3 text-sm text-error-ink">
                {errors.items?.message ?? errors.items?.root?.message}
              </p>
            ) : null}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight">Catálogo</h3>
            <p className="mt-1 text-sm text-muted">
              Stock según la sucursal de origen seleccionada.
            </p>
            <div className="mt-4">
              <TransferProductPicker
                sucursalOrigenId={sucursalOrigenId}
                excludedProductIds={excludedProductIds}
                disabled={busy}
                onAdd={handleAddProduct}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold tracking-tight">Resumen</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Productos</dt>
                <dd className="tabular-nums font-medium">{items.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Unidades</dt>
                <dd className="tabular-nums font-medium">{unitsTotal}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={busy}>
                <ArrowRightLeft className="size-4" aria-hidden />
                {busy
                  ? 'Guardando…'
                  : mode === 'edit'
                    ? 'Guardar cambios'
                    : 'Guardar borrador'}
              </Button>
            </div>
            {errors.root?.message ? (
              <div
                className="mt-4 rounded-xl border border-error/20 bg-error-soft px-3.5 py-3 text-sm text-error-ink"
                role="alert"
              >
                {errors.root.message}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </form>
  )
}

function labelSucursal(sucursal: Sucursal) {
  return `${sucursal.nombre} (${sucursal.codigo})`
}
