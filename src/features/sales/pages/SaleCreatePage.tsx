import { useNavigate } from 'react-router'
import { useToast } from '@/components/common/use-toast'
import { SaleForm } from '@/features/sales/components/SaleForm'
import { useCreateSale } from '@/features/sales/hooks/use-sale-mutations'
import {
  toCreateVentaRequest,
  type SaleFormValues,
} from '@/features/sales/schemas/sale-schema'
import type { SaleTicketNavigationState } from '@/features/sales/ticket/ticket-settings'
import { formatComprobante, formatMoney } from '@/lib/utils/format'

export function SaleCreatePage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const createMutation = useCreateSale()

  async function handleSubmit(
    values: SaleFormValues,
    checkout?: { cashReceived?: number },
  ) {
    const sale = await createMutation.mutateAsync(toCreateVentaRequest(values))
    pushToast({
      tone: 'success',
      title: 'Venta registrada',
      description: `La venta ${formatComprobante(sale.numero)} se confirmó por ${formatMoney(sale.total)}.`,
    })
    const state: SaleTicketNavigationState = {
      printTicket: true,
      cashReceived: checkout?.cashReceived,
    }
    void navigate(`/ventas/${sale.id}`, { state })
  }

  return (
    <SaleForm
      submitting={createMutation.isPending}
      onSubmit={handleSubmit}
      onCancel={() => void navigate('/ventas')}
    />
  )
}
