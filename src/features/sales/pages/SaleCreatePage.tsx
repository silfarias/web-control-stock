import { useNavigate } from 'react-router'
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
    <SaleForm
      submitting={createMutation.isPending}
      onSubmit={handleSubmit}
      onCancel={() => void navigate('/ventas')}
    />
  )
}
