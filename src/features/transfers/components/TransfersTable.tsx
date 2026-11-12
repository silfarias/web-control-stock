import { Link } from 'react-router'
import { ArrowRight, Eye, Pencil } from 'lucide-react'
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
import { TransferStatusBadge } from '@/features/transfers/components/TransferStatusBadge'
import type { Transferencia } from '@/features/transfers/types'
import { getTransferDraftActions } from '@/features/transfers/utils/transfer-actions'
import { cn } from '@/lib/utils/cn'
import { formatComprobante, formatDateTime } from '@/lib/utils/format'

type TransfersTableProps = {
  transfers: Transferencia[]
}

export function TransfersTable({ transfers }: TransfersTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[56rem]">
        <TableCaption className="sr-only">Listado de transferencias</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Transferencia</TableHead>
            <TableHead>Origen → Destino</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((transfer) => {
            const { canEdit } = getTransferDraftActions(transfer.estado, true)
            return (
              <TableRow key={transfer.id}>
                <TableCell>
                  <p className="font-medium tabular-nums">
                    {formatComprobante(transfer.numero)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {transfer.items?.length ?? 0}{' '}
                    {(transfer.items?.length ?? 0) === 1 ? 'producto' : 'productos'}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm">
                    <span className="font-medium">{transfer.sucursalOrigen?.nombre ?? '—'}</span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted" aria-hidden />
                    <span className="font-medium">{transfer.sucursalDestino?.nombre ?? '—'}</span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted">
                    {transfer.sucursalOrigen?.codigo ?? '—'} →{' '}
                    {transfer.sucursalDestino?.codigo ?? '—'}
                  </p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted tabular-nums">
                  {formatDateTime(transfer.createdAt)}
                </TableCell>
                <TableCell>
                  <p className="text-sm">{transfer.usuario?.nombre ?? '—'}</p>
                </TableCell>
                <TableCell>
                  <TransferStatusBadge estado={transfer.estado} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={`/transferencias/${transfer.id}`}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'size-9',
                          )}
                          aria-label={`Ver detalle de transferencia ${formatComprobante(transfer.numero)}`}
                        >
                          <Eye className="size-4" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalle</TooltipContent>
                    </Tooltip>
                    {canEdit ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={`/transferencias/${transfer.id}/editar`}
                            className={cn(
                              buttonVariants({ variant: 'ghost', size: 'icon' }),
                              'size-9',
                            )}
                            aria-label={`Editar borrador ${formatComprobante(transfer.numero)}`}
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>Editar borrador</TooltipContent>
                      </Tooltip>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
