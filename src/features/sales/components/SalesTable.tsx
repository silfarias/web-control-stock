import { Link } from 'react-router'
import { Eye } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
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
      <Table className="min-w-[48rem]">
        <TableCaption className="sr-only">Listado de ventas</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Venta</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Pago</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>
                <p className="font-medium tabular-nums">{formatComprobante(sale.numero)}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {sale.usuario?.nombre ?? '—'} · {sale.items?.length ?? 0}{' '}
                  {(sale.items?.length ?? 0) === 1 ? 'ítem' : 'ítems'}
                </p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted tabular-nums">
                {formatDateTime(sale.createdAt)}
              </TableCell>
              <TableCell>{paymentMethodLabel(sale.metodoPago)}</TableCell>
              <TableCell>
                <SaleStatusBadge estado={sale.estado} />
              </TableCell>
              <TableCell className="whitespace-nowrap font-medium tabular-nums">
                {formatMoney(sale.total)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  {sale.estado === 'CONFIRMADA' ? (
                    <CancelSaleButton sale={sale} className="h-9 px-3" />
                  ) : null}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={`/ventas/${sale.id}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9')}
                        aria-label={`Ver detalle de venta ${formatComprobante(sale.numero)}`}
                      >
                        <Eye className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Ver detalle</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
