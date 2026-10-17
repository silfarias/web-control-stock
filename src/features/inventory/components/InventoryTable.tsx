import { Link } from 'react-router'
import { Eye, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">Existencias de inventario</caption>
          <thead>
            <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Producto
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Código
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Categoría
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Mínimo
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const product = item.producto
              const status = product
                ? getStockStatus(item.cantidad, product.minimoStock)
                : item.cantidad <= 0
                  ? 'out'
                  : 'unknown'

              return (
                <tr key={item.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3.5 sm:px-5">
                    {product ? (
                      <p className="font-medium">{product.nombre}</p>
                    ) : (
                      <p className="text-sm text-muted">Producto eliminado</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap sm:px-5">
                    {product ? (
                      <span className="font-mono text-xs tracking-tight">{product.codigo}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted sm:px-5">
                    {product?.categoria?.nombre ?? '—'}
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3.5 tabular-nums font-medium sm:px-5',
                      status === 'out' && 'text-error-ink',
                      status === 'low' && 'text-warning-ink',
                    )}
                  >
                    {item.cantidad}
                  </td>
                  <td className="px-4 py-3.5 tabular-nums text-muted sm:px-5">
                    {product?.minimoStock ?? '—'}
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <StockStatusBadge status={status} />
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    {product ? (
                      <div className="flex items-center justify-end gap-1">
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
                        {canAdjust ? (
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
                        ) : null}
                      </div>
                    ) : (
                      <span className="block text-right text-muted">—</span>
                    )}
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
