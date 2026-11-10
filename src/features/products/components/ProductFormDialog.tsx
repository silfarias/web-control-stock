import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { MoneyInput } from '@/components/ui/MoneyInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useCategoryOptions } from '@/features/categories/hooks/use-category-options'
import {
  emptyPurchaseProductQuickFormValues,
  purchaseProductQuickFormSchema,
  type PurchaseProductQuickFormValues,
} from '@/features/products/schemas/product-schema'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  submitting?: boolean
  /** Prefijo opcional para el nombre (p. ej. texto de búsqueda). */
  initialNombre?: string
  onSubmit: (values: PurchaseProductQuickFormValues) => Promise<void>
}

export function ProductFormDialog({
  open,
  onOpenChange,
  submitting = false,
  initialNombre = '',
  onSubmit,
}: ProductFormDialogProps) {
  if (!open) return null

  return (
    <ProductFormDialogContent
      key={initialNombre || 'new'}
      submitting={submitting}
      initialNombre={initialNombre}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  )
}

type ContentProps = {
  submitting: boolean
  initialNombre: string
  onOpenChange: (open: boolean) => void
  onSubmit: (values: PurchaseProductQuickFormValues) => Promise<void>
}

function ProductFormDialogContent({
  submitting,
  initialNombre,
  onOpenChange,
  onSubmit,
}: ContentProps) {
  const categoriesQuery = useCategoryOptions()
  const categories = categoriesQuery.data ?? []

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseProductQuickFormValues>({
    resolver: zodResolver(purchaseProductQuickFormSchema),
    defaultValues: {
      ...emptyPurchaseProductQuickFormValues,
      nombre: initialNombre,
    },
  })

  const busy = submitting || isSubmitting

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values)
      onOpenChange(false)
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  return (
    <Dialog
      open
      onOpenChange={onOpenChange}
      title="Nuevo producto"
      description="Datos mínimos para sumarlo a la compra. El stock se carga al confirmar la adquisición."
      className="max-w-2xl"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button type="submit" form="product-quick-form" disabled={busy}>
            {busy ? 'Creando…' : 'Crear y agregar'}
          </Button>
        </div>
      }
    >
      <form id="product-quick-form" className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          label="Nombre"
          required
          disabled={busy}
          error={errors.nombre?.message}
          autoFocus
          {...register('nombre')}
        />
        <Textarea
          label="Descripción"
          disabled={busy}
          error={errors.descripcion?.message}
          hint="Opcional. Máximo 500 caracteres."
          {...register('descripcion')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Código interno"
            disabled={busy}
            error={errors.codigo?.message}
            hint="Opcional. Si no lo tenés, se asigna uno provisional."
            {...register('codigo')}
          />
          <Input
            label="Código de barras"
            disabled={busy}
            error={errors.codigoBarras?.message}
            hint="Opcional. Podés cargarlo después."
            {...register('codigoBarras')}
          />
        </div>

        <div className="flex w-full flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">
            Categoría <span className="text-error">*</span>
          </span>
          <Controller
            name="categoriaId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
                disabled={busy || categoriesQuery.isLoading}
              >
                <SelectTrigger
                  aria-invalid={errors.categoriaId ? true : undefined}
                  className={cn(errors.categoriaId && 'border-error')}
                >
                  <SelectValue
                    placeholder={
                      categoriesQuery.isLoading
                        ? 'Cargando categorías…'
                        : 'Seleccioná una categoría'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoriaId?.message ? (
            <span className="text-xs text-error-ink" role="alert">
              {errors.categoriaId.message}
            </span>
          ) : categoriesQuery.isError ? (
            <span className="text-xs text-error-ink" role="alert">
              {getApiErrorMessage(categoriesQuery.error)}
            </span>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="precioCosto"
            control={control}
            render={({ field }) => (
              <MoneyInput
                label="Precio de costo"
                required
                prefix="$"
                disabled={busy}
                error={errors.precioCosto?.message}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                getInputRef={field.ref}
                onValueChange={(values) => field.onChange(values.value)}
              />
            )}
          />
          <Controller
            name="precioVenta"
            control={control}
            render={({ field }) => (
              <MoneyInput
                label="Precio de venta"
                required
                prefix="$"
                disabled={busy}
                error={errors.precioVenta?.message}
                name={field.name}
                value={field.value}
                onBlur={field.onBlur}
                getInputRef={field.ref}
                onValueChange={(values) => field.onChange(values.value)}
              />
            )}
          />
        </div>

        <Input
          label="Stock mínimo"
          required
          inputMode="numeric"
          disabled={busy}
          error={errors.minimoStock?.message}
          hint="Referencia operativa. El stock actual lo define la compra."
          {...register('minimoStock')}
        />

        {errors.root?.message ? (
          <div
            className="rounded-xl border border-error/20 bg-error-soft px-3.5 py-3 text-sm text-error-ink"
            role="alert"
          >
            {errors.root.message}
          </div>
        ) : null}
      </form>
    </Dialog>
  )
}
