import { useIsMutating } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select'
import { useSucursal } from '@/features/sucursales/hooks/use-sucursal'
import { cn } from '@/lib/utils/cn'

type SucursalSelectorProps = {
  className?: string
  compact?: boolean
}

export function SucursalSelector({ className, compact = false }: SucursalSelectorProps) {
  const { status, sucursales, sucursalId, setSucursalId, isLoading, error } = useSucursal()
  const mutating = useIsMutating() > 0
  const locked = mutating

  if (status === 'idle') return null

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex h-9 min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs text-muted',
          compact ? 'max-w-[9.5rem]' : 'max-w-[14rem]',
          className,
        )}
      >
        <Building2 className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">Cargando…</span>
      </div>
    )
  }

  if (status === 'empty' || status === 'error' || sucursales.length === 0) {
    return (
      <div
        className={cn(
          'flex h-9 min-w-0 items-center gap-2 rounded-xl border border-warning/30 bg-warning-soft px-3 text-xs text-warning-ink',
          compact ? 'max-w-[11rem]' : 'max-w-[16rem]',
          className,
        )}
        title={error ?? 'Sin sucursales disponibles'}
      >
        <Building2 className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">Sin sucursal</span>
      </div>
    )
  }

  if (sucursales.length === 1) {
    const only = sucursales[0]
    return (
      <div
        className={cn(
          'flex h-9 min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground',
          compact ? 'max-w-[9.5rem] sm:max-w-[12rem]' : 'max-w-[16rem]',
          className,
        )}
        title={`${only.nombre} (${only.codigo})`}
      >
        <Building2 className="size-3.5 shrink-0 text-primary" aria-hidden />
        <span className="truncate">{only.nombre}</span>
      </div>
    )
  }

  const selected = sucursales.find((item) => item.id === sucursalId)

  return (
    <Select
      value={sucursalId != null ? String(sucursalId) : undefined}
      onValueChange={(value) => {
        if (locked) return
        setSucursalId(Number(value))
      }}
      disabled={locked}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          'min-w-0 gap-2 border-border bg-surface',
          compact ? 'max-w-[9.5rem] sm:max-w-[13rem]' : 'max-w-[16rem]',
          className,
        )}
        aria-label="Sucursal operativa"
        title={
          locked
            ? 'Esperá a que termine la operación en curso'
            : selected
              ? `${selected.nombre} (${selected.codigo})`
              : undefined
        }
      >
        <Building2 className="size-3.5 shrink-0 text-primary" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-left text-sm">
          {selected?.nombre ?? 'Sucursal'}
        </span>
      </SelectTrigger>
      <SelectContent align="end">
        {sucursales.map((item) => (
          <SelectItem key={item.id} value={String(item.id)} textValue={item.nombre}>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{item.nombre}</span>
              <span className="truncate text-xs text-muted">{item.codigo}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
