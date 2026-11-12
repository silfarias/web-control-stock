import { useNavigate } from 'react-router'
import { useToast } from '@/components/common/use-toast'
import { TransferForm } from '@/features/transfers/components/TransferForm'
import { useCreateTransfer } from '@/features/transfers/hooks/use-transfer-mutations'
import {
  toCreateTransferenciaRequest,
  type TransferFormValues,
} from '@/features/transfers/schemas/transfer-schema'
import { formatComprobante } from '@/lib/utils/format'

export function TransferCreatePage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const createMutation = useCreateTransfer()

  async function handleSubmit(values: TransferFormValues) {
    const transfer = await createMutation.mutateAsync(toCreateTransferenciaRequest(values))
    pushToast({
      tone: 'success',
      title: 'Borrador guardado',
      description: `La transferencia ${formatComprobante(transfer.numero)} quedó registrada como borrador.`,
    })
    void navigate(`/transferencias/${transfer.id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Armá el borrador con origen, destino y productos. El stock no cambia hasta confirmar la
        transferencia.
      </p>

      <TransferForm
        mode="create"
        submitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => void navigate('/transferencias')}
      />
    </div>
  )
}
