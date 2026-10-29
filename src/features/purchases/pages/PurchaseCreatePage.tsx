import { useNavigate } from 'react-router'
import { useToast } from '@/components/common/use-toast'
import { formatComprobante } from '@/lib/utils/format'
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm'
import { useCreatePurchase } from '@/features/purchases/hooks/use-purchase-mutations'
import {
  toCreateCompraRequest,
  type PurchaseFormValues,
} from '@/features/purchases/schemas/purchase-schema'

export function PurchaseCreatePage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const createMutation = useCreatePurchase()

  async function handleSubmit(values: PurchaseFormValues) {
    const purchase = await createMutation.mutateAsync(toCreateCompraRequest(values))
    pushToast({
      tone: 'success',
      title: 'Borrador guardado',
      description: `La compra ${formatComprobante(purchase.numero)} quedó registrada como borrador.`,
    })
    void navigate(`/compras/${purchase.id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <p className="max-w-2xl text-sm text-muted">
        Armá el borrador con proveedor y productos. El stock no cambia hasta confirmar la compra.
      </p>

      <PurchaseForm
        mode="create"
        submitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => void navigate('/compras')}
      />
    </div>
  )
}
