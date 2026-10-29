export const ticketKeys = {
  all: ['ticket'] as const,
  detail: () => [...ticketKeys.all, 'detail'] as const,
}
