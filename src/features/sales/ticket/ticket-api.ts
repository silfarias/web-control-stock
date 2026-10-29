import { apiClient } from '@/lib/api/client'
import type { TicketConfig, UpdateTicketRequest } from '@/features/sales/ticket/ticket-settings'

export const ticketApi = {
  get() {
    return apiClient.get<TicketConfig>('/ticket').then((response) => response.data)
  },

  update(payload: UpdateTicketRequest) {
    return apiClient.patch<TicketConfig>('/ticket', payload).then((response) => response.data)
  },
}
