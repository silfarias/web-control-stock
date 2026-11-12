import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ArrowRightLeft } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { TransferForm } from '@/features/transfers/components/TransferForm'
import { TransferStatusBadge } from '@/features/transfers/components/TransferStatusBadge'
import { useUpdateTransfer } from '@/features/transfers/hooks/use-transfer-mutations'
import { useTransfer } from '@/features/transfers/hooks/use-transfers'
import {
  toUpdateTransferenciaRequest,
  transferToFormValues,
  type TransferFormValues,
} from '@/features/transfers/schemas/transfer-schema'
import { getTransferDraftActions } from '@/features/transfers/utils/transfer-actions'
import { transferStatusLabel } from '@/features/transfers/utils/transfer-status'
import { getApiErrorMessage } from '@/lib/api/errors'
import { formatComprobante } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function TransferEditPage() {
  const { id: idParam } = useParams()
  const transferId = parseId(idParam)
  const navigate = useNavigate()
  const { pushToast } = useToast()

  const transferQuery = useTransfer(transferId)
  const updateMutation = useUpdateTransfer()

  const transfer = transferQuery.data
  const isEditable = getTransferDraftActions(transfer?.estado, true).canEdit

  const defaultValues = useMemo(
    () => (transfer && isEditable ? transferToFormValues(transfer) : undefined),
    [transfer, isEditable],
  )

  if (transferId == null) {
    return (
      <Card>
        <EmptyState
          icon={ArrowRightLeft}
          title="Transferencia no válida"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/transferencias"
              className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Volver al listado
            </Link>
          }
        />
      </Card>
    )
  }

  async function handleSubmit(values: TransferFormValues) {
    const updated = await updateMutation.mutateAsync({
      id: transferId!,
      payload: toUpdateTransferenciaRequest(values),
    })
    pushToast({
      tone: 'success',
      title: 'Borrador actualizado',
      description: `La transferencia ${formatComprobante(updated.numero)} se guardó correctamente.`,
    })
    void navigate(`/transferencias/${updated.id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <Link
          to={`/transferencias/${transferId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al detalle
        </Link>
        {transfer ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">
              Transferencia {formatComprobante(transfer.numero)}
            </p>
            <TransferStatusBadge estado={transfer.estado} />
          </div>
        ) : null}
        <p className="mt-1 text-sm text-muted">
          Solo los borradores se pueden modificar. Al guardar se actualizan sucursales e ítems.
        </p>
      </div>

      {transferQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando transferencia…</p>
        </Card>
      ) : null}

      {transferQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">
            No se pudo cargar la transferencia
          </p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(transferQuery.error)}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/transferencias"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver al listado
            </Link>
            <Button type="button" onClick={() => void transferQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {!transferQuery.isLoading && !transferQuery.isError && transfer && !isEditable ? (
        <Card>
          <EmptyState
            icon={ArrowRightLeft}
            title="Esta transferencia no se puede editar"
            description={`Solo los borradores admiten cambios. El estado actual es “${transferStatusLabel(transfer.estado)}”.`}
            action={
              <Link
                to={`/transferencias/${transferId}`}
                className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
              >
                Ir al detalle
              </Link>
            }
          />
        </Card>
      ) : null}

      {!transferQuery.isLoading &&
      !transferQuery.isError &&
      transfer &&
      isEditable &&
      defaultValues ? (
        <TransferForm
          key={transfer.id}
          mode="edit"
          defaultValues={defaultValues}
          submitting={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => void navigate(`/transferencias/${transferId}`)}
        />
      ) : null}
    </div>
  )
}
