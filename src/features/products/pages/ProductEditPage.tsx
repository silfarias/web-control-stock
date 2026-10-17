import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Package } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { ProductForm } from '@/features/products/components/ProductForm'
import { useProduct } from '@/features/products/hooks/use-product'
import { useUpdateProduct } from '@/features/products/hooks/use-product-mutations'
import {
  productToFormValues,
  toUpdateProductoRequest,
  type ProductFormValues,
} from '@/features/products/schemas/product-schema'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function ProductEditPage() {
  const { id: idParam } = useParams()
  const productId = parseId(idParam)
  const navigate = useNavigate()
  const { pushToast } = useToast()

  const productQuery = useProduct(productId)
  const updateMutation = useUpdateProduct()

  const defaultValues = useMemo(
    () => (productQuery.data ? productToFormValues(productQuery.data) : undefined),
    [productQuery.data],
  )

  if (productId == null) {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title="Producto no válido"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/productos"
              className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Volver al listado
            </Link>
          }
        />
      </Card>
    )
  }

  async function handleSubmit(values: ProductFormValues) {
    const product = await updateMutation.mutateAsync({
      id: productId!,
      payload: toUpdateProductoRequest(values),
    })
    pushToast({
      tone: 'success',
      title: 'Producto actualizado',
      description: `"${product.nombre}" se guardó correctamente.`,
    })
    void navigate(`/productos/${product.id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <Link
          to={`/productos/${productId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al detalle
        </Link>
        <h2 className="mt-3 text-[1.75rem] leading-9 font-semibold tracking-tight">
          {productQuery.isLoading
            ? 'Cargando…'
            : productQuery.data
              ? `Editar ${productQuery.data.nombre}`
              : 'Editar producto'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Actualizá los datos del catálogo. El stock disponible se gestiona en inventario.
        </p>
      </div>

      {productQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando producto…</p>
          <p className="mt-1 text-sm text-muted">Preparando el formulario con los datos actuales.</p>
        </Card>
      ) : null}

      {productQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar el producto</p>
          <p className="mt-1 text-sm text-error-ink/90">{getApiErrorMessage(productQuery.error)}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/productos"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver al listado
            </Link>
            <Button type="button" onClick={() => void productQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {!productQuery.isLoading && !productQuery.isError && defaultValues ? (
        <ProductForm
          key={productId}
          mode="edit"
          defaultValues={defaultValues}
          submitting={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => void navigate(`/productos/${productId}`)}
        />
      ) : null}
    </div>
  )
}
