import { Boxes } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-primary',
        className,
      )}
    >
      <Boxes className="size-[18px]" strokeWidth={1.75} aria-hidden />
    </span>
  )
}
