import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import {
  emptySupplierFormValues,
  supplierFormSchema,
  supplierToFormValues,
  type SupplierFormValues,
} from '@/features/suppliers/schemas/supplier-schema'
import type { Proveedor } from '@/features/suppliers/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

type SupplierFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Proveedor | null
  submitting?: boolean
  onSubmit: (values: SupplierFormValues) => Promise<void>
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  submitting = false,
  onSubmit,
}: SupplierFormDialogProps) {
  if (!open) return null

  return (
    <SupplierFormDialogContent
      key={supplier?.id ?? 'new'}
      supplier={supplier ?? null}
      submitting={submitting}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  )
}

type ContentProps = {
  supplier: Proveedor | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SupplierFormValues) => Promise<void>
}

function SupplierFormDialogContent({
  supplier,
  submitting,
  onOpenChange,
  onSubmit,
}: ContentProps) {
  const isEditing = Boolean(supplier)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: supplier ? supplierToFormValues(supplier) : emptySupplierFormValues,
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
      title={isEditing ? 'Editar proveedor' : 'Nuevo proveedor'}
      description={
        isEditing
          ? 'Actualizá los datos de contacto y el estado del proveedor.'
          : 'Completá los datos para agregar un proveedor al catálogo.'
      }
      className="max-w-xl"
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
          <Button type="submit" form="supplier-form" disabled={busy}>
            {busy ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear proveedor'}
          </Button>
        </div>
      }
    >
      <form id="supplier-form" className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          label="Nombre"
          required
          disabled={busy}
          error={errors.nombre?.message}
          autoFocus
          {...register('nombre')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="CUIT"
            disabled={busy}
            error={errors.cuit?.message}
            hint="Opcional."
            {...register('cuit')}
          />
          <Input
            label="Teléfono"
            disabled={busy}
            error={errors.telefono?.message}
            hint="Opcional."
            {...register('telefono')}
          />
        </div>

        <Input
          label="Email"
          type="email"
          disabled={busy}
          error={errors.email?.message}
          hint="Opcional."
          {...register('email')}
        />

        <Textarea
          label="Dirección"
          rows={2}
          disabled={busy}
          error={errors.direccion?.message}
          hint="Opcional."
          {...register('direccion')}
        />

        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3.5 py-3',
            'hover:bg-surface-muted/40',
          )}
        >
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/25"
            disabled={busy}
            {...register('activo')}
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium">Proveedor activo</span>
            <span className="mt-0.5 block text-xs text-muted">
              Los proveedores inactivos pueden quedar restringidos en operaciones futuras.
            </span>
          </span>
        </label>

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
