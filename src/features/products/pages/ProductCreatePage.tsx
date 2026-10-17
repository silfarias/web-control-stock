import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/components/common/use-toast'
import { ProductForm } from '@/features/products/components/ProductForm'
import { useCreateProduct } from '@/features/products/hooks/use-product-mutations'
import {
  toCreateProductoRequest,
  type ProductFormValues,
} from '@/features/products/schemas/product-schema'

export function ProductCreatePage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const createMutation = useCreateProduct()

  async function handleSubmit(values: ProductFormValues) {
    const product = await createMutation.mutateAsync(toCreateProductoRequest(values))
    pushToast({
      tone: 'success',
      title: 'Producto creado',
      description: `"${product.nombre}" se agregó al catálogo.`,
    })
    void navigate(`/productos/${product.id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <Link
          to="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Productos
        </Link>
        <h2 className="mt-3 text-[1.75rem] leading-9 font-semibold tracking-tight">
          Nuevo producto
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Completá los datos del catálogo. El stock inicial es opcional y solo se define al crear.
        </p>
      </div>

      <ProductForm
        mode="create"
        submitting={createMutation.isPending}
        onSubmit={handleSubmit}
        onCancel={() => void navigate('/productos')}
      />
    </div>
  )
}
