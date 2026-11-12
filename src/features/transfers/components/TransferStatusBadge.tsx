import { Badge } from '@/components/ui/Badge'
import type { EstadoTransferencia } from '@/features/transfers/types'
import {
  transferStatusLabel,
  transferStatusTone,
} from '@/features/transfers/utils/transfer-status'

type TransferStatusBadgeProps = {
  estado: EstadoTransferencia
}

export function TransferStatusBadge({ estado }: TransferStatusBadgeProps) {
  return <Badge tone={transferStatusTone(estado)}>{transferStatusLabel(estado)}</Badge>
}
