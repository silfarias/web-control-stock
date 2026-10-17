import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import {
  categorySchema,
  type CategoryFormValues,
} from '@/features/categories/schemas/category-schema'
import type { Categoria } from '@/features/categories/types'
import { getApiErrorMessage } from '@/lib/api/errors'

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Categoria | null
  submitting?: boolean
  onSubmit: (values: { nombre: string; descripcion?: string }) => Promise<void>
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  submitting = false,
  onSubmit,
}: CategoryFormDialogProps) {
  const isEditing = Boolean(category)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      nombre: category?.nombre ?? '',
      descripcion: category?.descripcion ?? '',
    })
  }, [open, category, reset])

  const busy = submitting || isSubmitting

  const submit = handleSubmit(async (values) => {
    try {
      const descripcion = values.descripcion.trim()
      await onSubmit({
        nombre: values.nombre.trim(),
        ...(descripcion
          ? { descripcion }
          : isEditing
            ? { descripcion: '' }
            : {}),
      })
      onOpenChange(false)
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar categoría' : 'Nueva categoría'}
      description={
        isEditing
          ? 'Actualizá el nombre o la descripción de la categoría.'
          : 'Completá los datos para agregar una categoría al catálogo.'
      }
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
          <Button type="submit" form="category-form" disabled={busy}>
            {busy ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </div>
      }
    >
      <form id="category-form" className="flex flex-col gap-4" onSubmit={submit} noValidate>
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
