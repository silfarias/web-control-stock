import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sucursalKeys } from '@/features/sucursales/api/query-keys'
import { sucursalesApi } from '@/features/sucursales/api/sucursales-api'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import type {
  CreateSucursalRequest,
  UpdateSucursalRequest,
} from '@/features/sucursales/types'

async function refreshOperableList(
  queryClient: ReturnType<typeof useQueryClient>,
  refetchMine: () => Promise<void>,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: sucursalKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: sucursalKeys.details() }),
    queryClient.invalidateQueries({ queryKey: sucursalKeys.me() }),
  ])
  await refetchMine()
}

export function useCreateSucursal() {
  const queryClient = useQueryClient()
  const { refetch } = useSucursal()

  return useMutation({
    mutationFn: (payload: CreateSucursalRequest) => sucursalesApi.create(payload),
    onSuccess: async () => {
      await refreshOperableList(queryClient, refetch)
    },
  })
}

export function useUpdateSucursal() {
  const queryClient = useQueryClient()
  const { refetch } = useSucursal()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSucursalRequest }) =>
      sucursalesApi.update(id, payload),
    onSuccess: async (sucursal) => {
      queryClient.setQueryData(sucursalKeys.detail(sucursal.id), sucursal)
      await refreshOperableList(queryClient, refetch)
    },
  })
}

export function useActivateSucursal() {
  const queryClient = useQueryClient()
  const { refetch } = useSucursal()

  return useMutation({
    mutationFn: (id: number) => sucursalesApi.activar(id),
    onSuccess: async (sucursal) => {
      queryClient.setQueryData(sucursalKeys.detail(sucursal.id), sucursal)
      await refreshOperableList(queryClient, refetch)
    },
  })
}

export function useDeleteSucursal() {
  const queryClient = useQueryClient()
  const { refetch } = useSucursal()

  return useMutation({
    mutationFn: (id: number) => sucursalesApi.remove(id),
    onSuccess: async (_data, id) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sucursalKeys.lists() }),
        queryClient.removeQueries({ queryKey: sucursalKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: sucursalKeys.me() }),
      ])
      await refetch()
    },
  })
}
