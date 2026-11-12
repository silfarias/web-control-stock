import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { transferKeys } from '@/features/transfers/api/query-keys'
import { transfersApi } from '@/features/transfers/api/transfers-api'
import type { SearchTransferenciasParams } from '@/features/transfers/types'

export function useTransfers(params: SearchTransferenciasParams) {
  return useQuery({
    queryKey: transferKeys.list(params),
    queryFn: () => transfersApi.search(params),
    placeholderData: keepPreviousData,
  })
}

export function useTransfer(id: number | null | undefined) {
  return useQuery({
    queryKey: transferKeys.detail(id ?? 0),
    queryFn: () => transfersApi.getById(id!),
    enabled: id != null && id > 0,
  })
}
