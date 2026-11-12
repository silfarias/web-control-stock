import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import {
  emptySucursalFormValues,
  sucursalFormSchema,
  sucursalToFormValues,
  type SucursalFormValues,
} from '@/features/sucursales/schemas/sucursal-schema'
import { CASA_CENTRAL_CODIGO, type Sucursal } from '@/features/sucursales/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

type SucursalFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sucursal?: Sucursal | null
  submitting?: boolean
  onSubmit: (values: SucursalFormValues) => Promise<void>
}

export function SucursalFormDialog({
  open,
  onOpenChange,
  sucursal,
  submitting = false,
  onSubmit,
}: SucursalFormDialogProps) {
  if (!open) return null

  return (
    <SucursalFormDialogContent
      key={sucursal?.id ?? 'new'}
      sucursal={sucursal ?? null}
      submitting={submitting}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
    />
  )
}

type ContentProps = {
  sucursal: Sucursal | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SucursalFormValues) => Promise<void>
}

function SucursalFormDialogContent({
  sucursal,
  submitting,
  onOpenChange,
  onSubmit,
}: ContentProps) {
  const isEditing = Boolean(sucursal)
  const isCasaCentral = sucursal?.codigo === CASA_CENTRAL_CODIGO

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SucursalFormValues>({
    resolver: zodResolver(sucursalFormSchema),
    defaultValues: sucursal ? sucursalToFormValues(sucursal) : emptySucursalFormValues,
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
      title={isEditing ? 'Editar sucursal' : 'Nueva sucursal'}
      description={
        isEditing
          ? 'Actualizá los datos y el estado de la sucursal.'
          : 'Al crear una sucursal se inicializa el stock de todos los productos en cero.'
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
          <Button type="submit" form="sucursal-form" disabled={busy}>
            {busy ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear sucursal'}
          </Button>
        </div>
      }
    >
      <form id="sucursal-form" className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          label="Nombre"
          required
          disabled={busy}
          error={errors.nombre?.message}
          autoFocus
          {...register('nombre')}
        />

        <Input
          label="Código"
          required
          disabled={busy || isCasaCentral}
          error={errors.codigo?.message}
          hint={
            isCasaCentral
              ? 'El código de Casa Central no se puede modificar.'
              : 'Se guarda en mayúsculas. Debe ser único.'
          }
          {...register('codigo')}
        />

        <Textarea
          label="Dirección"
          rows={2}
          disabled={busy}
          error={errors.direccion?.message}
          hint="Opcional."
          {...register('direccion')}
        />

        <Input
          label="Teléfono"
          disabled={busy}
          error={errors.telefono?.message}
          hint="Opcional."
          {...register('telefono')}
        />

        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border border-border px-3.5 py-3',
            'hover:bg-surface-muted/40',
            busy && 'pointer-events-none opacity-60',
          )}
        >
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/25"
            disabled={busy}
            {...register('activo')}
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium">Sucursal activa</span>
            <span className="mt-0.5 block text-xs text-muted">
              Las sucursales inactivas no aparecen en el selector operativo.
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
