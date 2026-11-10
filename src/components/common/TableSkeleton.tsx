import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

type TableSkeletonProps = {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 6, columns = 5 }: TableSkeletonProps) {
  return (
    <Card className="overflow-hidden p-4 sm:p-5">
      <div className="space-y-3">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`head-${index}`} className="h-3 w-20" />
          ))}
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: rows }).map((_, row) => (
            <div
              key={`row-${row}`}
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: columns }).map((_, col) => (
                <Skeleton
                  key={`cell-${row}-${col}`}
                  className={col === 0 ? 'h-10 w-full' : 'h-10 w-[85%]'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
