/** Tamaño de página por defecto para listados y consultas paginadas. */
export const DEFAULT_PAGE_SIZE = 10

export type PaginationItem = number | 'ellipsis'

/**
 * Genera los ítems de paginación (números + ellipsis) alrededor de la página actual.
 */
export function getPaginationItems(current: number, total: number): PaginationItem[] {
  if (total <= 0) return []
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total])
  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page >= 1 && page <= total) pages.add(page)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const items: PaginationItem[] = []
  let previous = 0

  for (const page of sorted) {
    if (previous > 0 && page - previous > 1) {
      items.push('ellipsis')
    }
    items.push(page)
    previous = page
  }

  return items
}
