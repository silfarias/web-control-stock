import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, ClipboardList } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { useToast } from '@/components/common/use-toast'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buttonVariants } from '@/components/ui/button-variants'
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm'
import { PurchaseStatusBadge } from '@/features/purchases/components/PurchaseStatusBadge'
import { useUpdatePurchase } from '@/features/purchases/hooks/use-purchase-mutations'
import { usePurchase } from '@/features/purchases/hooks/use-purchases'
import {
  purchaseToFormValues,
  toUpdateCompraRequest,
  type PurchaseFormValues,
} from '@/features/purchases/schemas/purchase-schema'
import { getPurchaseDraftActions } from '@/features/purchases/utils/purchase-actions'
import { getApiErrorMessage } from '@/lib/api/errors'
import { cn } from '@/lib/utils/cn'

function parseId(value: string | undefined) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function PurchaseEditPage() {
  const { id: idParam } = useParams()
  const purchaseId = parseId(idParam)
  const navigate = useNavigate()
  const { pushToast } = useToast()

  const purchaseQuery = usePurchase(purchaseId)
  const updateMutation = useUpdatePurchase()

  const purchase = purchaseQuery.data
  const isEditable = getPurchaseDraftActions(purchase?.estado, true).canEdit

  const defaultValues = useMemo(
    () => (purchase && isEditable ? purchaseToFormValues(purchase) : undefined),
    [purchase, isEditable],
  )

  if (purchaseId == null) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardList}
          title="Compra no válida"
          description="El identificador indicado no es correcto."
          action={
            <Link
              to="/compras"
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

  async function handleSubmit(values: PurchaseFormValues) {
    const updated = await updateMutation.mutateAsync({
      id: purchaseId!,
      payload: toUpdateCompraRequest(values),
    })
    pushToast({
      tone: 'success',
      title: 'Borrador actualizado',
      description: `La compra #${updated.id} se guardó correctamente.`,
    })
    void navigate(`/compras/${updated.id}`)
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <div className="min-w-0">
        <Link
          to={`/compras/${purchaseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al detalle
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h2 className="text-[1.75rem] leading-9 font-semibold tracking-tight">
            {purchaseQuery.isLoading
              ? 'Cargando…'
              : purchase
                ? `Editar compra #${purchase.id}`
                : 'Editar compra'}
          </h2>
          {purchase ? <PurchaseStatusBadge estado={purchase.estado} /> : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Solo las compras en borrador se pueden modificar. Al guardar se actualizan proveedor e
          ítems.
        </p>
      </div>

      {purchaseQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando compra…</p>
          <p className="mt-1 text-sm text-muted">Preparando el formulario con los datos actuales.</p>
        </Card>
      ) : null}

      {purchaseQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar la compra</p>
          <p className="mt-1 text-sm text-error-ink/90">
            {getApiErrorMessage(purchaseQuery.error)}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Link
              to="/compras"
              className={cn(buttonVariants({ variant: 'outline' }), 'bg-surface')}
            >
              Volver al listado
            </Link>
            <Button type="button" onClick={() => void purchaseQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {!purchaseQuery.isLoading && !purchaseQuery.isError && purchase && !isEditable ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Esta compra no se puede editar"
            description={`Solo los borradores admiten cambios. El estado actual es “${purchase.estado === 'CONFIRMADA' ? 'Confirmada' : 'Cancelada'}”.`}
            action={
              <Link
                to={`/compras/${purchaseId}`}
                className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex')}
              >
                Ir al detalle
              </Link>
            }
          />
        </Card>
      ) : null}

      {!purchaseQuery.isLoading &&
      !purchaseQuery.isError &&
      purchase &&
      isEditable &&
      defaultValues ? (
        <PurchaseForm
          key={purchase.id}
          mode="edit"
          defaultValues={defaultValues}
          currentSupplier={purchase.proveedor}
          submitting={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => void navigate(`/compras/${purchaseId}`)}
        />
      ) : null}
    </div>
  )
}
