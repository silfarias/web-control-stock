import type { ButtonHTMLAttributes, ComponentProps } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils/cn'

export function Pagination({ className, ...props }: ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="Paginación"
      data-slot="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  )
}

export function PaginationContent({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  )
}

export function PaginationItem({ className, ...props }: ComponentProps<'li'>) {
  return <li data-slot="pagination-item" className={cn(className)} {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<VariantProps<typeof buttonVariants>, 'size'> &
  ButtonHTMLAttributes<HTMLButtonElement>

export function PaginationLink({
  className,
  isActive,
  size = 'icon',
  type = 'button',
  ...props
}: PaginationLinkProps) {
  return (
    <button
      type={type}
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      data-active={isActive || undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
        }),
        size === 'icon' && 'size-9',
        className,
      )}
      {...props}
    />
  )
}

export function PaginationPrevious({
  className,
  text = 'Anterior',
  ...props
}: ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Ir a la página anterior"
      size="md"
      className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
      {...props}
    >
      <ChevronLeft className="size-4" aria-hidden />
      <span className="hidden sm:inline">{text}</span>
    </PaginationLink>
  )
}

export function PaginationNext({
  className,
  text = 'Siguiente',
  ...props
}: ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Ir a la página siguiente"
      size="md"
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <span className="hidden sm:inline">{text}</span>
      <ChevronRight className="size-4" aria-hidden />
    </PaginationLink>
  )
}

export function PaginationEllipsis({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">Más páginas</span>
    </span>
  )
}
