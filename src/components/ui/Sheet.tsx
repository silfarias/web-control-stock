import type { ComponentProps } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetPortal = DialogPrimitive.Portal

export function SheetOverlay({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      {...props}
    />
  )
}

export function SheetContent({
  className,
  children,
  side = 'right',
  showClose = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  side?: 'top' | 'bottom' | 'left' | 'right'
  showClose?: boolean
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-surface text-foreground transition-transform duration-200 ease-out',
          side === 'left' && 'inset-y-0 left-0 h-full w-[260px] border-r border-border',
          side === 'right' && 'inset-y-0 right-0 h-full w-[260px] border-l border-border',
          side === 'top' && 'inset-x-0 top-0 border-b border-border',
          side === 'bottom' && 'inset-x-0 bottom-0 border-t border-border',
          className,
        )}
        {...props}
      >
        {children}
        {showClose ? (
          <DialogPrimitive.Close className="absolute top-3 right-3 grid size-9 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-muted hover:text-foreground">
            <X className="size-4" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Content>
    </SheetPortal>
  )
}

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn('text-base font-semibold tracking-tight', className)}
      {...props}
    />
  )
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-sm text-muted', className)}
      {...props}
    />
  )
}
