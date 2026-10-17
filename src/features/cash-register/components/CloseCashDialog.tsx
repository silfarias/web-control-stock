import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useCloseCashRegister } from '@/features/cash-register/hooks/use-cash-register-mutations'
import {
  closeCashFormSchema,
  emptyCloseCashFormValues,
  toCerrarCajaRequest,
  type CloseCashFormValues,
} from '@/features/cash-register/schemas/cash-register-schema'
import type { Caja, CierreCajaResponse } from '@/features/cash-register/types'
import { getApiErrorMessage } from '@/lib/api/errors'
import { formatMoney } from '@/lib/utils/format'

type CloseCashDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  caja: Caja | null
  onClosed?: (result: CierreCajaResponse) => void
}

export function CloseCashDialog({
  open,
  onOpenChange,
  caja,
  onClosed,
}: CloseCashDialogProps) {
  const [lockedCaja, setLockedCaja] = useState<Caja | null>(null)

  if (open && caja && lockedCaja?.id !== caja.id) {
    setLockedCaja(caja)
  }
  if (!open && lockedCaja != null) {
    setLockedCaja(null)
  }

  if (!open || !lockedCaja) return null

  return (
    <CloseCashDialogContent
      key={lockedCaja.id}
      caja={lockedCaja}
      onOpenChange={onOpenChange}
      onClosed={onClosed}
    />
  )
}

type ContentProps = {
  caja: Caja
  onOpenChange: (open: boolean) => void
  onClosed?: (result: CierreCajaResponse) => void
}

function CloseCashDialogContent({ caja, onOpenChange, onClosed }: ContentProps) {
  const { pushToast } = useToast()
  const mutation = useCloseCashRegister()
  const [result, setResult] = useState<CierreCajaResponse | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CloseCashFormValues>({
    resolver: zodResolver(closeCashFormSchema),
    defaultValues: emptyCloseCashFormValues,
  })

  const busy = mutation.isPending || isSubmitting

  const submit = handleSubmit(async (values) => {
    try {
      const cierre = await mutation.mutateAsync({
        id: caja.id,
        payload: toCerrarCajaRequest(values),
      })
      setResult(cierre)
      pushToast({
        tone: 'success',
        title: 'Caja cerrada',
        description: `La caja #${cierre.caja.id} se cerró correctamente.`,
      })
      onClosed?.(cierre)
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error) })
    }
  })

  if (result) {
    return (
      <Dialog
        open
        onOpenChange={onOpenChange}
        title={`Cierre de caja #${result.caja.id}`}
        description="Resumen calculado por el servidor al cerrar."
        footer={
          <div className="flex justify-end">
            <Button type="button" onClick={() => onOpenChange(false)}>
              Listo
            </Button>
          </div>
        }
      >
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Monto esperado</dt>
            <dd className="tabular-nums font-medium">{formatMoney(result.montoEsperado)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Monto contado</dt>
            <dd className="tabular-nums font-medium">{formatMoney(result.montoCierre)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-3">
            <dt className="text-muted">Diferencia</dt>
            <dd className="tabular-nums font-semibold">{formatMoney(result.diferencia)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          La diferencia es contado menos esperado, según el backend (apertura + ventas + ingresos −
          egresos).
        </p>
      </Dialog>
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next)
      }}
      title={`Cerrar caja #${caja.id}`}
      description="Indicá el efectivo contado. El monto esperado y la diferencia los calcula el servidor al cerrar."
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
          <Button type="submit" form="close-cash-form" disabled={busy}>
            {busy ? 'Cerrando…' : 'Cerrar caja'}
          </Button>
        </div>
      }
    >
      <form id="close-cash-form" className="flex flex-col gap-4" onSubmit={submit} noValidate>
        <div className="rounded-xl bg-surface-muted px-4 py-3 text-sm">
          <p>
            Apertura:{' '}
            <span className="font-medium tabular-nums">{formatMoney(caja.montoApertura)}</span>
          </p>
          <p className="mt-1 text-muted">Responsable: {caja.usuario?.nombre ?? '—'}</p>
        </div>
        <Input
          label="Monto contado"
          required
          inputMode="decimal"
          autoFocus
          disabled={busy}
          error={errors.montoCierre?.message}
          hint="Efectivo físico al momento del cierre."
          {...register('montoCierre')}
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
