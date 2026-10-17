import { Link } from 'react-router'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card } from '@/components/ui/Card'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md px-6 py-10 text-center">
        <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">404</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Página no encontrada</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Esa ruta no forma parte del panel.
        </p>
        <div className="mt-6">
          <Link to="/" className={buttonVariants()}>
            Volver al panel
          </Link>
        </div>
      </Card>
    </div>
  )
}
