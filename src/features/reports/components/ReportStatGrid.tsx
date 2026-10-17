import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

export type ReportStat = {
  label: string
  value: ReactNode
  hint?: string
}

type ReportStatGridProps = {
  stats: ReportStat[]
  className?: string
}

export function ReportStatGrid({ stats, className }: ReportStatGridProps) {
  return (
    <div
      className={cn(
        'grid gap-3 sm:grid-cols-2 xl:grid-cols-4',
        className,
      )}
    >
      {stats.map((stat) => (
        <Card key={stat.label} className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
            {stat.value}
          </p>
          {stat.hint ? (
            <p className="mt-1 text-xs text-muted">{stat.hint}</p>
          ) : null}
        </Card>
      ))}
    </div>
  )
}
