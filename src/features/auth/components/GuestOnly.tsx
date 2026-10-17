import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/features/auth/hooks/use-auth'

export function GuestOnly() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="grid h-svh place-items-center overflow-hidden bg-background px-4 text-foreground">
        <div className="rounded-2xl border border-border bg-surface px-6 py-5 text-center">
          <p className="text-sm font-medium">Comprobando sesión…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
