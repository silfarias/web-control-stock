import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/features/auth/hooks/use-auth'

/** Protege rutas de escritura (creación/edición) para rol ADMIN. */
export function RequireAdmin() {
  const { user, isBootstrapping, isAuthenticated } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="grid min-h-40 place-items-center px-4 py-10 text-foreground">
        <div className="rounded-2xl border border-border bg-surface px-6 py-5 text-center">
          <p className="text-sm font-medium">Comprobando permisos…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/productos" replace />
  }

  return <Outlet />
}
