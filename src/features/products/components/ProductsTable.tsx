import { Link } from 'react-router'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { ProductStockCell } from '@/features/products/components/ProductStockCell'
import type { ProductStockMap } from '@/features/products/hooks/use-product-stocks'
import type { Producto } from '@/features/products/types'
import { cn } from '@/lib/utils/cn'
import { formatMoney } from '@/lib/utils/format'

type ProductsTableProps = {
  products: Producto[]
  stocks: ProductStockMap
  stocksLoading: boolean
  canManage?: boolean
  onDelete?: (product: Producto) => void
}

export function ProductsTable({
  products,
  stocks,
  stocksLoading,
  canManage = false,
  onDelete,
}: ProductsTableProps) {
  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">Listado de productos</caption>
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
                Precio venta
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-5">
                Stock
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium sm:px-5">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3.5 sm:px-5">
                  <div className="min-w-0">
                    <p className="font-medium">{product.nombre}</p>
                    {product.descripcion?.trim() ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted">{product.descripcion}</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap sm:px-5">
                  <span className="font-mono text-xs tracking-tight">{product.codigo}</span>
                </td>
                <td className="px-4 py-3.5 text-muted sm:px-5">
                  {product.categoria?.nombre ?? '—'}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap tabular-nums sm:px-5">
                  {formatMoney(product.precioVenta)}
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <ProductStockCell
                    cantidad={stocks[product.id]}
                    minimoStock={product.minimoStock}
                    loading={stocksLoading && stocks[product.id] === undefined}
                  />
                </td>
                <td className="px-4 py-3.5 sm:px-5">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/productos/${product.id}`}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9')}
                      aria-label={`Ver detalle de ${product.nombre}`}
                    >
                      <Eye className="size-4" />
                    </Link>
                    {canManage ? (
                      <>
                        <Link
                          to={`/productos/${product.id}/editar`}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'size-9',
                          )}
                          aria-label={`Editar ${product.nombre}`}
                        >
                          <Pencil className="size-4" />
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 text-error-ink hover:bg-error-soft hover:text-error-ink"
                          onClick={() => onDelete?.(product)}
                          aria-label={`Eliminar ${product.nombre}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    ) : null}
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
