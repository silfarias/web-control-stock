import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { Textarea } from '@/components/ui/Textarea'
import { useCreateCashMovement } from '@/features/cash-register/hooks/use-cash-register-mutations'
import {
  cashMovementFormSchema,
  emptyCashMovementFormValues,
  toCreateMovimientoCajaRequest,
  type CashMovementFormValues,
} from '@/features/cash-register/schemas/cash-register-schema'
import type { Caja } from '@/features/cash-register/types'
import {
  getApiErrorMessage,
  getUncertainMutationHint,
} from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'
import { formatComprobante } from '@/lib/utils/format'

type CashMovementDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  caja: Caja | null
}

const selectClassName = cn(
  'h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground transition-colors',
  'hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

export function CashMovementDialog({
  open,
  onOpenChange,
  caja,
}: CashMovementDialogProps) {
  if (!open || !caja) return null
  return <CashMovementDialogContent key={caja.id} caja={caja} onOpenChange={onOpenChange} />
}

function CashMovementDialogContent({
  caja,
  onOpenChange,
}: {
  caja: Caja
  onOpenChange: (open: boolean) => void
}) {
  const { pushToast } = useToast()
  const mutation = useCreateCashMovement()

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CashMovementFormValues>({
    resolver: zodResolver(cashMovementFormSchema),
    defaultValues: emptyCashMovementFormValues,
  })

  const busy = mutation.isPending || isSubmitting

  const submit = handleSubmit(async (values) => {
    if (busy) return
    try {
      const movement = await mutation.mutateAsync(toCreateMovimientoCajaRequest(values))
      pushToast({
        tone: 'success',
        title: values.tipo === 'INGRESO' ? 'Ingreso registrado' : 'Egreso registrado',
        description: `Movimiento #${movement.id} en la caja ${formatComprobante(caja.numero)}.`,
      })
      onOpenChange(false)
    } catch (error) {
      const message = getApiErrorMessage(error)
      const hint = getUncertainMutationHint(error)
      setError('root', {
        message: hint ? `${message} ${hint}` : message,
      })
    }
  })

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next)
      }}
      title="Movimiento manual"
      description={`Registrá un ingreso o egreso en la caja ${formatComprobante(caja.numero)}. No modifica saldos de forma arbitraria: queda como movimiento en el historial.`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Volver
          </Button>
          <Button type="submit" form="cash-movement-form" disabled={busy}>
            {busy ? 'Guardando…' : 'Registrar movimiento'}
          </Button>
        </div>
      }
    >
      <form id="cash-movement-form" className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <label className="flex w-full flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">
            Tipo <span className="text-error">*</span>
          </span>
          <select
            className={cn(selectClassName, errors.tipo && 'border-error')}
            disabled={busy}
            aria-invalid={errors.tipo ? true : undefined}
            {...register('tipo')}
          >
            <option value="INGRESO">Ingreso</option>
            <option value="EGRESO">Egreso</option>
          </select>
          {errors.tipo?.message ? (
            <span className="text-xs text-error-ink" role="alert">
              {errors.tipo.message}
            </span>
          ) : null}
        </label>

        <Controller
          name="monto"
          control={control}
          render={({ field }) => (
            <MoneyInput
              label="Monto"
              required
              prefix="$"
              disabled={busy}
              error={errors.monto?.message}
              hint="Mayor a 0, hasta 2 decimales."
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              getInputRef={field.ref}
              onValueChange={(values) => field.onChange(values.value)}
            />
          )}
        />

        <Textarea
          label="Descripción"
          required
          disabled={busy}
          error={errors.descripcion?.message}
          hint="Motivo del movimiento. Máximo 500 caracteres."
          {...register('descripcion')}
        />

        {errors.root?.message ? (
          <p className="text-sm text-error-ink" role="alert">
            {errors.root.message}
          </p>
        ) : null}
      </form>
    </Dialog>
  )
}
