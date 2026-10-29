import { Link } from 'react-router'
import { Eye } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { CancelSaleButton } from '@/features/sales/components/CancelSaleButton'
import { SaleStatusBadge } from '@/features/sales/components/SaleStatusBadge'
import type { Venta } from '@/features/sales/types'
import { paymentMethodLabel } from '@/features/sales/utils/sale-labels'
import { cn } from '@/lib/utils/cn'
import { formatComprobante, formatDateTime, formatMoney } from '@/lib/utils/format'

type SalesTableProps = {
  sales: Venta[]
}

export function SalesTable({ sales }: SalesTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <caption className="sr-only">Listado de ventas</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Venta
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Pago
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Total
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3.5 sm:px-5">
                  <p className="font-medium tabular-nums">{formatComprobante(sale.numero)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {sale.usuario?.nombre ?? '—'} · {sale.items?.length ?? 0}{' '}
                    {(sale.items?.length ?? 0) === 1 ? 'ítem' : 'ítems'}
                  </p>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted tabular-nums sm:px-5">
                  {formatDateTime(sale.createdAt)}
                </td>
                <td className="px-4 py-3.5 sm:px-5">{paymentMethodLabel(sale.metodoPago)}</td>
                <td className="px-4 py-3.5 sm:px-5">
                  <SaleStatusBadge estado={sale.estado} />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap tabular-nums font-medium sm:px-5">
                  {formatMoney(sale.total)}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <div className="flex items-center justify-end gap-1">
                    {sale.estado === 'CONFIRMADA' ? (
                      <CancelSaleButton sale={sale} className="h-9 px-3" />
                    ) : null}
                    <Link
                      to={`/ventas/${sale.id}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9')}
                      aria-label={`Ver detalle de venta ${formatComprobante(sale.numero)}`}
                    >
                      <Eye className="size-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
