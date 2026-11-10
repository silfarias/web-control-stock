import { Link } from 'react-router'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
import { StockStatusBadge } from '@/features/inventory/components/StockStatusBadge'
import type { Stock } from '@/features/inventory/types'
import { getStockStatus } from '@/features/inventory/utils/stock-status'
import { cn } from '@/lib/utils/cn'

type InventoryTableProps = {
  items: Stock[]
  canAdjust?: boolean
  onAdjust?: (item: Stock) => void
}

export function InventoryTable({ items, canAdjust = false, onAdjust }: InventoryTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <Table className="min-w-[52rem]">
        <TableCaption className="sr-only">Existencias de inventario</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Producto</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const product = item.producto
            const status = product
              ? getStockStatus(item.cantidad, product.minimoStock)
              : item.cantidad <= 0
                ? 'out'
                : 'unknown'

            return (
              <TableRow key={item.id}>
                <TableCell>
                  {product ? (
                    <p className="font-medium">{product.nombre}</p>
                  ) : (
                    <p className="text-sm text-muted">Producto eliminado</p>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {product ? (
                    <span className="font-mono text-xs tracking-tight">{product.codigo}</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted">{product?.categoria?.nombre ?? '—'}</TableCell>
                <TableCell
                  className={cn(
                    'tabular-nums font-medium',
                    status === 'out' && 'text-error-ink',
                    status === 'low' && 'text-warning-ink',
                  )}
                >
                  {item.cantidad}
                </TableCell>
                <TableCell className="tabular-nums text-muted">
                  {product?.minimoStock ?? '—'}
                </TableCell>
                <TableCell>
                  <StockStatusBadge status={status} />
                </TableCell>
                <TableCell>
                  {product ? (
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            to={`/inventario/${product.id}`}
                            className={cn(
                              buttonVariants({ variant: 'ghost', size: 'icon' }),
                              'size-9',
                            )}
                            aria-label={`Ver inventario de ${product.nombre}`}
                          >
                            <Eye className="size-4" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent>Ver detalle</TooltipContent>
                      </Tooltip>
                      {canAdjust ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-9"
                              onClick={() => onAdjust?.(item)}
                              aria-label={`Ajustar stock de ${product.nombre}`}
                            >
                              <SlidersHorizontal className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ajustar stock</TooltipContent>
                        </Tooltip>
                      ) : null}
                    </div>
                  ) : (
                    <span className="block text-right text-muted">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
