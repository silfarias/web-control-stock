import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/common/use-toast'
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
      description: `La compra #${purchase.id} quedó registrada como borrador.`,
    })
    void navigate(`/compras/${purchase.id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <Link
          to="/compras"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Compras
        </Link>
        <h2 className="mt-3 text-[1.75rem] leading-9 font-semibold tracking-tight">
          Nueva compra
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Armá el borrador con proveedor y productos. La confirmación y el impacto en stock se
          gestionan en una etapa posterior.
        </p>
      </div>

      <PurchaseForm
        mode="create"
        submitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => void navigate('/compras')}
      />
    </div>
  )
}
