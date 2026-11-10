import { Link } from 'react-router'
import { Eye, Pencil, Trash2 } from 'lucide-react'
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
      <Table className="min-w-[64rem]">
        <TableCaption className="sr-only">Listado de productos</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Producto</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Código de barras</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Precio venta</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="min-w-0">
                  <p className="font-medium">{product.nombre}</p>
                  {product.descripcion?.trim() ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">{product.descripcion}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="font-mono text-xs tracking-tight">{product.codigo}</span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span className="font-mono text-xs tracking-tight">
                  {product.codigoBarras?.trim() || '—'}
                </span>
              </TableCell>
              <TableCell className="text-muted">{product.categoria?.nombre ?? '—'}</TableCell>
              <TableCell className="whitespace-nowrap tabular-nums">
                {formatMoney(product.precioVenta)}
              </TableCell>
              <TableCell>
                <ProductStockCell
                  cantidad={stocks[product.id]}
                  minimoStock={product.minimoStock}
                  loading={stocksLoading && stocks[product.id] === undefined}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={`/productos/${product.id}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9')}
                        aria-label={`Ver detalle de ${product.nombre}`}
                      >
                        <Eye className="size-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>Ver detalle</TooltipContent>
                  </Tooltip>
                  {canManage ? (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>Editar</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
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
                        </TooltipTrigger>
                        <TooltipContent>Eliminar</TooltipContent>
                      </Tooltip>
                    </>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
