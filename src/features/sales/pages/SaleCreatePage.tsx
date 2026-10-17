import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/common/use-toast'
import { SaleForm } from '@/features/sales/components/SaleForm'
import { useCreateSale } from '@/features/sales/hooks/use-sale-mutations'
import {
  toCreateVentaRequest,
  type SaleFormValues,
} from '@/features/sales/schemas/sale-schema'
import { formatMoney } from '@/lib/utils/format'

export function SaleCreatePage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const createMutation = useCreateSale()

  async function handleSubmit(values: SaleFormValues) {
    const sale = await createMutation.mutateAsync(toCreateVentaRequest(values))
    pushToast({
      tone: 'success',
      title: 'Venta registrada',
      description: `La venta #${sale.id} se confirmó por ${formatMoney(sale.total)}.`,
    })
    void navigate(`/ventas/${sale.id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <Link
          to="/ventas"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Ventas
        </Link>
        <h2 className="mt-3 text-[1.75rem] leading-9 font-semibold tracking-tight">
          Nueva venta
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Agregá productos y elegí el método de pago. En efectivo se necesita caja abierta.
        </p>
      </div>

      <SaleForm
        submitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => void navigate('/ventas')}
      />
    </div>
  )
}
