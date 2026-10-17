import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useOpenCashRegister } from '@/features/cash-register/hooks/use-cash-register-mutations'
import {
  emptyOpenCashFormValues,
  openCashFormSchema,
  toAbrirCajaRequest,
  type OpenCashFormValues,
} from '@/features/cash-register/schemas/cash-register-schema'
import { getApiErrorMessage } from '@/lib/api/errors'

type OpenCashDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OpenCashDialog({ open, onOpenChange }: OpenCashDialogProps) {
  if (!open) return null
  return <OpenCashDialogContent onOpenChange={onOpenChange} />
}

function OpenCashDialogContent({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  const { pushToast } = useToast()
  const mutation = useOpenCashRegister()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OpenCashFormValues>({
    resolver: zodResolver(openCashFormSchema),
    defaultValues: emptyOpenCashFormValues,
  })

  const busy = mutation.isPending || isSubmitting

  const submit = handleSubmit(async (values) => {
    try {
      const caja = await mutation.mutateAsync(toAbrirCajaRequest(values))
      pushToast({
        tone: 'success',
        title: 'Caja abierta',
        description: `La caja #${caja.id} quedó abierta con el monto inicial indicado.`,
      })
      onOpenChange(false)
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next)
      }}
      title="Abrir caja"
      description="Solo puede haber una caja abierta a la vez. El monto inicial lo define el efectivo disponible al comenzar."
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
          <Button type="submit" form="open-cash-form" disabled={busy}>
            {busy ? 'Abriendo…' : 'Abrir caja'}
          </Button>
        </div>
      }
    >
      <form id="open-cash-form" className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <Input
          label="Monto de apertura"
          required
          inputMode="decimal"
          autoFocus
          disabled={busy}
          error={errors.montoApertura?.message}
          hint="Puede ser 0. Usá hasta 2 decimales."
          {...register('montoApertura')}
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
