import { Link } from 'react-router'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { PaymentMethod, RecentSale } from '@/features/dashboard/data/mock-dashboard'
import { formatCurrency } from '@/lib/utils/format'

const payments: Record<PaymentMethod, { label: string; tone: BadgeTone }> = {
  EFECTIVO: { label: 'Efectivo', tone: 'success' },
  TRANSFERENCIA: { label: 'Transferencia', tone: 'info' },
  TARJETA_DEBITO: { label: 'Débito', tone: 'accent' },
  TARJETA_CREDITO: { label: 'Crédito', tone: 'neutral' },
}

export function RecentSales({ sales }: { sales: RecentSale[] }) {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Ventas recientes</h2>
          <p className="mt-1 text-sm text-muted">Una selección de operaciones de hoy.</p>
        </div>
        <Link
          to="/ventas"
          className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Ver ventas
        </Link>
      </div>
      <div className="mt-4 -mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <caption className="sr-only">Ventas recientes de demostración</caption>
          <thead>
            <tr className="text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="border-b border-border pb-3 pr-3 font-medium">
                Comprobante
              </th>
              <th scope="col" className="border-b border-border pb-3 pr-3 font-medium">
                Hora
              </th>
              <th scope="col" className="border-b border-border pb-3 pr-3 font-medium">
                Pago
              </th>
              <th scope="col" className="border-b border-border pb-3 pr-3 font-medium">
                Artículos
              </th>
              <th scope="col" className="border-b border-border pb-3 text-right font-medium">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => {
              const payment = payments[sale.payment]

              return (
                <tr key={sale.id} className="last:[&>td]:border-b-0">
                  <td className="border-b border-border py-3.5 pr-3 font-medium">{sale.id}</td>
                  <td className="border-b border-border py-3.5 pr-3 text-muted tabular-nums">
                    {sale.time}
                  </td>
                  <td className="border-b border-border py-3.5 pr-3">
                    <Badge tone={payment.tone}>{payment.label}</Badge>
                  </td>
                  <td className="border-b border-border py-3.5 pr-3 text-muted tabular-nums">
                    {sale.items}
                  </td>
                  <td className="border-b border-border py-3.5 text-right font-medium tabular-nums">
                    {formatCurrency(sale.total)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
