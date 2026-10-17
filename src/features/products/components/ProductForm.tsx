import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCategoryOptions } from '@/features/categories/hooks/use-category-options'
import {
  emptyProductFormValues,
  productFormSchema,
  type ProductFormValues,
} from '@/features/products/schemas/product-schema'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

type ProductFormProps = {
  mode: 'create' | 'edit'
  defaultValues?: ProductFormValues
  submitting?: boolean
  onSubmit: (values: ProductFormValues) => Promise<void>
  onCancel: () => void
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-[#c5d0c8] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

export function ProductForm({
  mode,
  defaultValues = emptyProductFormValues,
  submitting = false,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const categoriesQuery = useCategoryOptions()
  const categories = categoriesQuery.data ?? []

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  const busy = submitting || isSubmitting

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
        <p className="mt-1 text-sm text-muted">Nombre y descripción visibles en el catálogo.</p>
        <div className="mt-4 flex flex-col gap-4">
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
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight">Identificación y clasificación</h3>
        <p className="mt-1 text-sm text-muted">
          Códigos únicos y categoría del producto. El código y el código de barras no pueden
          repetirse.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Código interno"
            required
            disabled={busy}
            error={errors.codigo?.message}
            {...register('codigo')}
          />
          <Input
            label="Código de barras"
            required
            disabled={busy}
            error={errors.codigoBarras?.message}
            {...register('codigoBarras')}
          />
          <label className="flex w-full flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-foreground">
              Categoría <span className="text-error">*</span>
            </span>
            <select
              className={cn(selectClassName, errors.categoriaId && 'border-error')}
              disabled={busy || categoriesQuery.isLoading}
              aria-invalid={errors.categoriaId ? true : undefined}
              {...register('categoriaId')}
            >
              <option value="">
                {categoriesQuery.isLoading ? 'Cargando categorías…' : 'Seleccioná una categoría'}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.nombre}
                </option>
              ))}
            </select>
            {errors.categoriaId?.message ? (
              <span className="text-xs text-error-ink" role="alert">
                {errors.categoriaId.message}
              </span>
            ) : categoriesQuery.isError ? (
              <span className="text-xs text-error-ink" role="alert">
                {getApiErrorMessage(categoriesQuery.error)}
              </span>
            ) : (
              <span className="text-xs text-muted">Obligatoria. Se listan todas las categorías.</span>
            )}
          </label>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight">Precios</h3>
        <p className="mt-1 text-sm text-muted">Importes en pesos argentinos, con hasta 2 decimales.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Precio de costo"
            required
            inputMode="decimal"
            disabled={busy}
            error={errors.precioCosto?.message}
            placeholder="0.00"
            {...register('precioCosto')}
          />
          <Input
            label="Precio de venta"
            required
            inputMode="decimal"
            disabled={busy}
            error={errors.precioVenta?.message}
            placeholder="0.00"
            {...register('precioVenta')}
          />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-sm font-semibold tracking-tight">Configuración de inventario</h3>
        <p className="mt-1 text-sm text-muted">
          El stock mínimo se usa como referencia operativa. Los ajustes de cantidad se gestionan en
          inventario.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input
            label="Stock mínimo"
            required
            inputMode="numeric"
            disabled={busy}
            error={errors.minimoStock?.message}
            {...register('minimoStock')}
          />
          {mode === 'create' ? (
            <Input
              label="Stock inicial"
              inputMode="numeric"
              disabled={busy}
              error={errors.stockInicial?.message}
              hint="Opcional. Si lo omitís, el producto queda con stock 0."
              {...register('stockInicial')}
            />
          ) : (
            <div className="rounded-xl border border-border bg-surface-muted/60 px-3.5 py-3 text-sm text-muted sm:self-end">
              El stock actual no se modifica desde esta pantalla.
            </div>
          )}
        </div>
      </Card>

      {errors.root?.message ? (
        <div
          className="rounded-xl border border-error/20 bg-error-soft px-3.5 py-3 text-sm text-error-ink"
          role="alert"
        >
          {errors.root.message}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  )
}
