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
import { CashStatusBadge } from '@/features/cash-register/components/CashStatusBadge'
import type { Caja } from '@/features/cash-register/types'
import { cn } from '@/lib/utils/cn'
import { formatComprobante, formatDateTime, formatMoney } from '@/lib/utils/format'

type CashHistoryTableProps = {
  cajas: Caja[]
}

export function CashHistoryTable({ cajas }: CashHistoryTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[48rem]">
        <TableCaption className="sr-only">Historial de cajas</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Caja</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Apertura</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Montos</TableHead>
            <TableHead className="text-right">Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cajas.map((caja) => (
            <TableRow key={caja.id}>
              <TableCell>
                <p className="font-medium tabular-nums">{formatComprobante(caja.numero)}</p>
              </TableCell>
              <TableCell>
                <p className="font-medium">{caja.usuario?.nombre ?? '—'}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted tabular-nums">
                {formatDateTime(caja.abiertaEn)}
              </TableCell>
              <TableCell>
                <CashStatusBadge estado={caja.estado} />
              </TableCell>
              <TableCell>
                <p className="tabular-nums">Apertura {formatMoney(caja.montoApertura)}</p>
                {caja.estado === 'CERRADA' && caja.montoCierre != null ? (
                  <p className="mt-0.5 text-xs text-muted tabular-nums">
                    Cierre {formatMoney(caja.montoCierre)}
                    {caja.montoEsperado != null
                      ? ` · Esperado ${formatMoney(caja.montoEsperado)}`
                      : ''}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={`/caja/${caja.id}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9')}
                        aria-label={`Ver detalle de caja ${formatComprobante(caja.numero)}`}
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
