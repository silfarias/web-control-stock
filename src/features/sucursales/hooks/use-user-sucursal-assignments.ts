import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { sucursalKeys } from '@/features/sucursales/api/query-keys'
import { sucursalesApi } from '@/features/sucursales/api/sucursales-api'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type { AssignUsuarioSucursalesRequest } from '@/features/sucursales/types'

export function useUserSucursalAssignments(
  usuarioId: number | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: sucursalKeys.assignments(usuarioId ?? 0),
    queryFn: () => sucursalesApi.getAsignaciones(usuarioId!),
    enabled: (options?.enabled ?? true) && usuarioId != null && usuarioId > 0,
  })
}

export function useReplaceUserSucursalAssignments() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { refetch } = useSucursal()

  return useMutation({
    mutationFn: ({
      usuarioId,
      payload,
    }: {
      usuarioId: number
      payload: AssignUsuarioSucursalesRequest
    }) => sucursalesApi.replaceAsignaciones(usuarioId, payload),
    onSuccess: async (asignadas, variables) => {
      queryClient.setQueryData(sucursalKeys.assignments(variables.usuarioId), asignadas)
      await queryClient.invalidateQueries({
        queryKey: sucursalKeys.assignments(variables.usuarioId),
      })

      // Si el cambio afecta al usuario autenticado (poco frecuente: ADMIN), refrescar selector.
      if (user?.id === variables.usuarioId) {
        await queryClient.invalidateQueries({ queryKey: sucursalKeys.me() })
        await refetch()
      }
    },
  })
}
