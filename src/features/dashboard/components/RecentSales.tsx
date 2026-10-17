import { Link } from 'react-router'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import type { RecentSale } from '@/features/dashboard/types'
import type { MetodoPago } from '@/features/sales/types'
import { paymentMethodLabel } from '@/features/sales/utils/sale-labels'
import { formatMoney } from '@/lib/utils/format'

const paymentTones: Record<MetodoPago, BadgeTone> = {
  EFECTIVO: 'success',
  TRANSFERENCIA: 'info',
  TARJETA_DEBITO: 'accent',
  TARJETA_CREDITO: 'neutral',
  OTRO: 'neutral',
}

type RecentSalesProps = {
  sales: RecentSale[]
  loading?: boolean
  error?: boolean
  errorMessage?: string
  onRetry?: () => void
}

export function RecentSales({
  sales,
  loading = false,
  error = false,
  errorMessage,
  onRetry,
}: RecentSalesProps) {
  return (
    <Card className="min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight">Ventas recientes</h2>
          <p className="mt-1 text-sm text-muted">Últimas operaciones confirmadas.</p>
        </div>
        <Link
          to="/ventas"
          className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          Ver ventas
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 h-32 animate-pulse rounded-xl bg-surface-muted/70" aria-busy="true" />
      ) : null}

      {error ? (
        <div className="mt-6">
          <p className="text-sm text-error-ink">
            {errorMessage ?? 'No se pudieron cargar las ventas recientes.'}
          </p>
          {onRetry ? (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-primary hover:text-primary-hover"
              onClick={onRetry}
            >
              Reintentar
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && sales.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Todavía no hay ventas confirmadas.</p>
      ) : null}

      {!loading && !error && sales.length > 0 ? (
        <div className="mt-4 -mx-1 overflow-x-auto px-1">
          <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
            <caption className="sr-only">Ventas recientes</caption>
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
              {sales.map((sale) => (
                <tr key={sale.id} className="last:[&>td]:border-b-0">
                  <td className="border-b border-border py-3.5 pr-3 font-medium">
                    <Link
                      to={`/ventas/${sale.id}`}
                      className="text-primary hover:underline"
                    >
                      {sale.displayId}
                    </Link>
                  </td>
                  <td className="border-b border-border py-3.5 pr-3 text-muted tabular-nums">
                    {sale.time}
                  </td>
                  <td className="border-b border-border py-3.5 pr-3">
                    <Badge tone={paymentTones[sale.payment]}>
                      {paymentMethodLabel(sale.payment)}
                    </Badge>
                  </td>
                  <td className="border-b border-border py-3.5 pr-3 text-muted tabular-nums">
                    {sale.items}
                  </td>
                  <td className="border-b border-border py-3.5 text-right font-medium tabular-nums">
                    {formatMoney(sale.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  )
}
