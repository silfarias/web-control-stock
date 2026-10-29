import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { useCancelSale } from '@/features/sales/hooks/use-sale-mutations'
import type { Venta } from '@/features/sales/types'
import { getApiErrorMessage, normalizeApiError } from '@/lib/api/errors'
import { formatComprobante, formatMoney } from '@/lib/utils/format'

type CancelSaleButtonProps = {
  sale: Venta
  className?: string
}

export function CancelSaleButton({ sale, className }: CancelSaleButtonProps) {
  const { pushToast } = useToast()
  const cancelMutation = useCancelSale()
  const [open, setOpen] = useState(false)

  if (sale.estado !== 'CONFIRMADA') return null

  const comprobante = formatComprobante(sale.numero)
  const description =
    sale.metodoPago === 'EFECTIVO'
      ? `Se anula la venta ${comprobante}. El stock vuelve a entrar y se registra un egreso de ${formatMoney(sale.total)}. Si la caja de esa venta ya cerró, tiene que haber una caja abierta.`
      : `Se anula la venta ${comprobante}. El stock de los productos vuelve a entrar.`

  async function handleConfirm() {
    try {
      const updated = await cancelMutation.mutateAsync(sale.id)
      pushToast({
        tone: 'success',
        title: 'Venta anulada',
        description: `La venta ${formatComprobante(updated.numero)} quedó anulada.`,
      })
      setOpen(false)
    } catch (error) {
      const apiError = normalizeApiError(error)
      pushToast({
        tone: 'error',
        title: 'No se pudo anular',
        description:
          apiError.code === 'CJ02'
            ? 'Para anular una venta en efectivo hace falta una caja abierta.'
            : getApiErrorMessage(error),
      })
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={className}
        onClick={() => setOpen(true)}
      >
        Anular
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={`Anular venta ${comprobante}`}
        description={description}
        confirmLabel="Anular venta"
        tone="danger"
        loading={cancelMutation.isPending}
        onConfirm={() => void handleConfirm()}
      />
    </>
  )
}
