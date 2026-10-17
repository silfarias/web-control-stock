import { Badge } from '@/components/ui/Badge'
import type { EstadoCaja } from '@/features/cash-register/types'
import { cashStatusLabel, cashStatusTone } from '@/features/cash-register/utils/cash-status'

type CashStatusBadgeProps = {
  estado: EstadoCaja
}

export function CashStatusBadge({ estado }: CashStatusBadgeProps) {
  return <Badge tone={cashStatusTone(estado)}>{cashStatusLabel(estado)}</Badge>
}
