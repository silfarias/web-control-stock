import { Link } from 'react-router'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
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
        <div className="mt-4 -mx-1 px-1">
          <Table className="min-w-[32rem]">
            <TableCaption className="sr-only">Ventas recientes</TableCaption>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-0 pr-3 sm:px-0 sm:pr-3">Comprobante</TableHead>
                <TableHead className="px-0 pr-3 sm:px-0 sm:pr-3">Hora</TableHead>
                <TableHead className="px-0 pr-3 sm:px-0 sm:pr-3">Pago</TableHead>
                <TableHead className="px-0 pr-3 sm:px-0 sm:pr-3">Artículos</TableHead>
                <TableHead className="px-0 text-right sm:px-0">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="px-0 pr-3 font-medium sm:px-0 sm:pr-3">
                    <Link to={`/ventas/${sale.id}`} className="text-primary hover:underline">
                      {sale.displayId}
                    </Link>
                  </TableCell>
                  <TableCell className="px-0 pr-3 text-muted tabular-nums sm:px-0 sm:pr-3">
                    {sale.time}
                  </TableCell>
                  <TableCell className="px-0 pr-3 sm:px-0 sm:pr-3">
                    <Badge tone={paymentTones[sale.payment]}>
                      {paymentMethodLabel(sale.payment)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-0 pr-3 text-muted tabular-nums sm:px-0 sm:pr-3">
                    {sale.items}
                  </TableCell>
                  <TableCell className="px-0 text-right font-medium tabular-nums sm:px-0">
                    {formatMoney(sale.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </Card>
  )
}
