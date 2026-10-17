import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useCreateStockAdjustment } from '@/features/inventory/hooks/use-stock-adjustment'
import {
  emptyAdjustmentFormValues,
  estimateStockAfter,
  toCreateAjusteRequest,
  adjustmentFormSchema,
  type AdjustmentFormValues,
} from '@/features/inventory/schemas/adjustment-schema'
import type { TipoAjusteStock } from '@/features/inventory/types'
import { movementTypeLabel } from '@/features/inventory/utils/movement-labels'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

type AdjustmentProduct = {
  id: number
  nombre: string
  codigo: string
}

type StockAdjustmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: AdjustmentProduct | null
  /** Cantidad actual. `null` = sin registro (el backend inicia en 0). */
  currentStock: number | null
  stockUnavailable?: boolean
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  product,
  currentStock,
  stockUnavailable = false,
}: StockAdjustmentDialogProps) {
  if (!open || !product) return null

  return (
    <StockAdjustmentDialogContent
      key={product.id}
      product={product}
      currentStock={currentStock}
      stockUnavailable={stockUnavailable}
      onOpenChange={onOpenChange}
    />
  )
}

type ContentProps = {
  product: AdjustmentProduct
  currentStock: number | null
  stockUnavailable: boolean
  onOpenChange: (open: boolean) => void
}

function StockAdjustmentDialogContent({
  product,
  currentStock,
  stockUnavailable,
  onOpenChange,
}: ContentProps) {
  const { pushToast } = useToast()
  const mutation = useCreateStockAdjustment()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, setPending] = useState<AdjustmentFormValues | null>(null)

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdjustmentFormValues>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: emptyAdjustmentFormValues,
  })

  const tipo = useWatch({ control, name: 'tipo' })
  const cantidadRaw = useWatch({ control, name: 'cantidad' })

  function closeAll() {
    setConfirmOpen(false)
    setPending(null)
    onOpenChange(false)
  }

  const baselineStock = currentStock ?? 0
  const cantidadNumber = /^\d+$/.test(cantidadRaw?.trim() ?? '')
    ? Number(cantidadRaw.trim())
    : null

  const estimated =
    cantidadNumber != null && cantidadNumber >= 1 && tipo
      ? estimateStockAfter(baselineStock, tipo as TipoAjusteStock, cantidadNumber)
      : null

  const insufficientClient =
    tipo === 'AJUSTE_SALIDA' &&
    currentStock != null &&
    cantidadNumber != null &&
    cantidadNumber > currentStock

  const busy = mutation.isPending || isSubmitting

  const stockLabel = useMemo(() => {
    if (stockUnavailable) return 'No disponible'
    if (currentStock == null) return 'Sin registro (se iniciará en 0)'
    return String(currentStock)
  }, [currentStock, stockUnavailable])

  const submitForm = handleSubmit((values) => {
    if (stockUnavailable) {
      setError('root', {
        message: 'No se puede ajustar porque no se pudo consultar el stock actual.',
      })
      return
    }

    if (
      values.tipo === 'AJUSTE_SALIDA' &&
      currentStock != null &&
      Number(values.cantidad) > currentStock
    ) {
      setError('cantidad', {
        message: `Stock insuficiente. Disponible: ${currentStock}.`,
      })
      return
    }

    setPending(values)
    setConfirmOpen(true)
  })

  async function confirmAdjustment() {
    if (!pending) return

    try {
      const result = await mutation.mutateAsync(toCreateAjusteRequest(product.id, pending))
      const isIn = pending.tipo === 'AJUSTE_ENTRADA'
      pushToast({
        tone: 'success',
        title: isIn ? 'Entrada registrada' : 'Salida registrada',
        description: `“${product.nombre}” quedó con ${result.stock.cantidad} unidades.`,
      })
      closeAll()
    } catch (error) {
      setConfirmOpen(false)
      setError('root', { message: getApiErrorMessage(error) })
    }
  }

  const isEntrada = (pending?.tipo ?? tipo) === 'AJUSTE_ENTRADA'
  const pendingQty = pending ? Number(pending.cantidad) : 0
  const pendingEstimate = pending
    ? estimateStockAfter(baselineStock, pending.tipo, pendingQty)
    : null

  return (
    <>
      <Dialog
        open
        onOpenChange={(next) => {
          if (!next) closeAll()
        }}
        title="Ajustar stock"
        description="Registrá una entrada o salida manual. El movimiento queda en el historial."
        className="max-w-xl"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeAll} disabled={busy}>
              Cancelar
            </Button>
            <Button type="submit" form="stock-adjustment-form" disabled={busy || stockUnavailable}>
              Continuar
            </Button>
          </div>
        }
      >
        <form
          id="stock-adjustment-form"
          className="flex flex-col gap-4"
          onSubmit={submitForm}
          noValidate
        >
          <div className="rounded-xl border border-border bg-surface-muted/50 px-3.5 py-3">
            <p className="text-sm font-medium">{product.nombre}</p>
            <p className="mt-0.5 font-mono text-xs text-muted">{product.codigo}</p>
            <p className="mt-2 text-sm text-muted">
              Stock actual:{' '}
              <span className="font-medium tabular-nums text-foreground">{stockLabel}</span>
            </p>
          </div>

          <label className="flex w-full flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              Tipo de ajuste <span className="text-error">*</span>
            </span>
            <select
              className={cn(selectClassName, errors.tipo && 'border-error')}
              disabled={busy}
              {...register('tipo')}
            >
              <option value="AJUSTE_ENTRADA">{movementTypeLabel('AJUSTE_ENTRADA')}</option>
              <option value="AJUSTE_SALIDA">{movementTypeLabel('AJUSTE_SALIDA')}</option>
            </select>
            {errors.tipo?.message ? (
              <span className="text-xs text-error-ink" role="alert">
                {errors.tipo.message}
              </span>
            ) : (
              <span className="text-xs text-muted">
                {tipo === 'AJUSTE_ENTRADA'
                  ? 'Se van a agregar unidades al stock.'
                  : 'Se van a retirar unidades del stock.'}
              </span>
            )}
          </label>

          <Input
            label="Cantidad"
            required
            inputMode="numeric"
            disabled={busy}
            error={errors.cantidad?.message}
            {...register('cantidad')}
          />

          {estimated != null ? (
            <div
              className={cn(
                'rounded-xl border px-3.5 py-3 text-sm',
                insufficientClient || estimated < 0
                  ? 'border-error/20 bg-error-soft text-error-ink'
                  : 'border-border bg-surface-muted/50 text-muted',
              )}
            >
              {insufficientClient || estimated < 0 ? (
                <p>La cantidad supera el stock disponible. No se puede registrar esta salida.</p>
              ) : (
                <p>
                  Resultado estimado:{' '}
                  <span className="font-semibold tabular-nums text-foreground">
                    {baselineStock} → {estimated}
                  </span>
                  <span className="mt-1 block text-xs">
                    Estimación. El stock final se confirma al guardar.
                  </span>
                </p>
              )}
            </div>
          ) : null}

          {currentStock == null && !stockUnavailable ? (
            <p className="text-xs text-muted">
              Este producto no tiene registro de stock. El primer ajuste creará el registro partiendo
              de 0.
            </p>
          ) : null}

          <Textarea
            label="Motivo"
            required
            rows={2}
            disabled={busy}
            error={errors.motivo?.message}
            hint="Obligatorio. Máximo 500 caracteres."
            {...register('motivo')}
          />

          <Textarea
            label="Observación"
            disabled={busy}
            error={errors.descripcion?.message}
            hint="Opcional."
            rows={2}
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

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (!next && !mutation.isPending) {
            setConfirmOpen(false)
            setPending(null)
          }
        }}
        title={isEntrada ? 'Confirmar entrada de stock' : 'Confirmar salida de stock'}
        description={
          pending
            ? `Vas a ${isEntrada ? 'agregar' : 'retirar'} ${pendingQty} unidad${pendingQty === 1 ? '' : 'es'} de “${product.nombre}”. Stock estimado: ${baselineStock} → ${pendingEstimate}.`
            : ''
        }
        confirmLabel="Confirmar ajuste"
        tone={isEntrada ? 'default' : 'danger'}
        loading={mutation.isPending}
        onConfirm={() => void confirmAdjustment()}
      />
    </>
  )
}
