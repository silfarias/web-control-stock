import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination'
import { getPaginationItems } from '@/lib/api/pagination'
import { cn } from '@/lib/utils/cn'

type ListPaginationProps = {
  pageNumber: number
  totalPages: number
  count?: number
  /** Etiqueta del recurso, p. ej. "producto" / "productos". */
  itemLabel?: { singular: string; plural: string }
  /** Texto de resumen extra (se muestra después del conteo si hay). */
  summaryExtra?: string
  disabled?: boolean
  onPageChange: (page: number) => void
  className?: string
  /** Si es false, no muestra el resumen a la izquierda. */
  showSummary?: boolean
}

export function ListPagination({
  pageNumber,
  totalPages,
  count,
  itemLabel,
  summaryExtra,
  disabled = false,
  onPageChange,
  className,
  showSummary = true,
}: ListPaginationProps) {
  if (totalPages <= 1) {
    if (!showSummary || count == null) return null

    const label =
      itemLabel != null
        ? count === 1
          ? itemLabel.singular
          : itemLabel.plural
        : null

    return (
      <p className={cn('text-sm text-muted', className)}>
        {count}
        {label ? ` ${label}` : null}
        {summaryExtra ? ` · ${summaryExtra}` : null}
      </p>
    )
  }

  const items = getPaginationItems(pageNumber, totalPages)
  const label =
    count != null && itemLabel != null
      ? count === 1
        ? itemLabel.singular
        : itemLabel.plural
      : null

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {showSummary ? (
        <p className="text-sm text-muted">
          Página {pageNumber} de {totalPages}
          {count != null ? (
            <>
              {' '}
              · {count}
              {label ? ` ${label}` : null}
            </>
          ) : null}
          {summaryExtra ? ` · ${summaryExtra}` : null}
        </p>
      ) : (
        <span className="hidden sm:block" />
      )}

      <Pagination className="mx-0 w-auto justify-start sm:justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              disabled={disabled || pageNumber <= 1}
              onClick={() => onPageChange(Math.max(1, pageNumber - 1))}
            />
          </PaginationItem>

          {items.map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  isActive={item === pageNumber}
                  disabled={disabled}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              disabled={disabled || pageNumber >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, pageNumber + 1))}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
