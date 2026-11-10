import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const alertVariants = cva(
  'relative w-full rounded-2xl border px-4 py-3.5 text-sm [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg~*]:pl-8',
  {
    variants: {
      tone: {
        info: 'border-info/20 bg-info-soft text-info-ink',
        success: 'border-success/20 bg-success-soft text-success-ink',
        warning: 'border-warning/30 bg-warning-soft text-warning-ink',
        error: 'border-error/20 bg-error-soft text-error-ink',
      },
    },
    defaultVariants: {
      tone: 'info',
    },
  },
)

type AlertProps = HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>

export function Alert({ className, tone, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ tone }), className)}
      {...props}
    />
  )
}

export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />
}

export function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
}
