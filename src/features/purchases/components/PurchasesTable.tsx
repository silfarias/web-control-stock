import { Link } from 'react-router'
import { Eye, Pencil } from 'lucide-react'
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
import { PurchaseStatusBadge } from '@/features/purchases/components/PurchaseStatusBadge'
import type { Compra } from '@/features/purchases/types'
import { getPurchaseDraftActions } from '@/features/purchases/utils/purchase-actions'
import { cn } from '@/lib/utils/cn'
import { formatComprobante, formatDateTime, formatMoney } from '@/lib/utils/format'

type PurchasesTableProps = {
  purchases: Compra[]
  canManage?: boolean
}

export function PurchasesTable({ purchases, canManage = false }: PurchasesTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[48rem]">
        <TableCaption className="sr-only">Listado de compras</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Compra</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchases.map((purchase) => {
            const { canEdit } = getPurchaseDraftActions(purchase.estado, canManage)
            return (
              <TableRow key={purchase.id}>
                <TableCell>
                  <p className="font-medium tabular-nums">{formatComprobante(purchase.numero)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {purchase.items?.length ?? 0}{' '}
                    {(purchase.items?.length ?? 0) === 1 ? 'ítem' : 'ítems'}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="font-medium">{purchase.proveedor?.nombre ?? '—'}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted tabular-nums">
                  {formatDateTime(purchase.createdAt)}
                </TableCell>
                <TableCell>
                  <PurchaseStatusBadge estado={purchase.estado} />
                </TableCell>
                <TableCell className="whitespace-nowrap font-medium tabular-nums">
                  {formatMoney(purchase.total)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={`/compras/${purchase.id}`}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'size-9',
                          )}
                          aria-label={`Ver detalle de compra ${formatComprobante(purchase.numero)}`}
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
                            to={`/compras/${purchase.id}/editar`}
                            className={cn(
                              buttonVariants({ variant: 'ghost', size: 'icon' }),
                              'size-9',
                            )}
                            aria-label={`Editar borrador de compra ${formatComprobante(purchase.numero)}`}
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
