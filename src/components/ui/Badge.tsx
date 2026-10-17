import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-surface-muted text-foreground',
        accent: 'bg-accent-soft text-accent-ink',
        success: 'bg-success-soft text-success-ink',
        warning: 'bg-warning-soft text-warning-ink',
        error: 'bg-error-soft text-error-ink',
        info: 'bg-info-soft text-info-ink',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
)

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>

type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
