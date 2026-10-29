import type { CSSProperties, ReactElement } from 'react'
import { ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils/cn'

type ChartFrameProps = {
  children: ReactElement
  className?: string
  style?: CSSProperties
}

export function ChartFrame({ children, className, style }: ChartFrameProps) {
  return (
    <div className={cn('w-full', className)} style={style}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

type ChartTooltipCardProps = {
  title: string
  rows: Array<{ label: string; value: string }>
}

export function ChartTooltipCard({ title, rows }: ChartTooltipCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 text-xs">
      <p className="font-medium text-foreground">{title}</p>
      <dl className="mt-1.5 space-y-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-muted">{row.label}</dt>
            <dd className="font-medium tabular-nums text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
