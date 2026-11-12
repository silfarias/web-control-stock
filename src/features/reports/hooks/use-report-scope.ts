import { useSearchParams } from 'react-router'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type { ReportScope } from '@/features/reports/api/query-keys'

/** Alcance de reportes: sucursal operativa o consolidado (ADMIN, sin header). */
export function useReportScope() {
  const { user } = useAuth()
  const { sucursalId, isReady } = useSucursal()
  const [searchParams, setSearchParams] = useSearchParams()
  const isAdmin = user?.role === 'ADMIN'
  const wantsConsolidated =
    isAdmin && searchParams.get('alcance') === 'consolidado'

  const scope: ReportScope = wantsConsolidated
    ? 'consolidated'
    : (sucursalId ?? 'consolidated')

  const consolidated = wantsConsolidated

  function setConsolidated(next: boolean) {
    if (!isAdmin) return
    const params = new URLSearchParams(searchParams)
    if (next) params.set('alcance', 'consolidado')
    else params.delete('alcance')
    setSearchParams(params, { replace: true })
  }

  return {
    isAdmin,
    scope,
    consolidated,
    setConsolidated,
    enabled: wantsConsolidated || isReady,
  }
}
