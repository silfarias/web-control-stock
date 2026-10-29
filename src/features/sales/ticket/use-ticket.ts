import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ticketApi } from '@/features/sales/ticket/ticket-api'
import { ticketKeys } from '@/features/sales/ticket/query-keys'
import type { UpdateTicketRequest } from '@/features/sales/ticket/ticket-settings'

export function useTicketConfig(enabled = true) {
  return useQuery({
    queryKey: ticketKeys.detail(),
    queryFn: () => ticketApi.get(),
    enabled,
    staleTime: 0,
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTicketRequest) => ticketApi.update(payload),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketKeys.detail(), ticket)
    },
  })
}
