import { useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import type { Venta } from '@/features/sales/types'
import { buildTicketHtml } from '@/features/sales/ticket/build-ticket-html'
import { printHtml } from '@/features/sales/ticket/print-ticket'
import { TicketPreview } from '@/features/sales/ticket/TicketPreview'
import { toTicketSettings } from '@/features/sales/ticket/ticket-settings'
import { useTicketConfig } from '@/features/sales/ticket/use-ticket'
import { getApiErrorMessage } from '@/lib/api/errors'

type TicketDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  sale: Venta
  cashReceived?: number
  autoPrint?: boolean
}

export function TicketDialog({
  open,
  onOpenChange,
  sale,
  cashReceived,
  autoPrint = false,
}: TicketDialogProps) {
  const ticketQuery = useTicketConfig(open)
  const printed = useRef(false)
  const openedAt = useRef(0)
  const settings = ticketQuery.data ? toTicketSettings(ticketQuery.data) : null

  useEffect(() => {
    if (!open) {
      printed.current = false
      return
    }
    openedAt.current = Date.now()
  }, [open])

  const html = useMemo(
    () => (settings ? buildTicketHtml({ sale, settings, cashReceived }) : ''),
    [sale, settings, cashReceived],
  )

  const configReady =
    open &&
    settings != null &&
    !ticketQuery.isLoading &&
    !ticketQuery.isFetching &&
    (ticketQuery.dataUpdatedAt >= openedAt.current || ticketQuery.failureCount > 0)

  useEffect(() => {
    if (!configReady || !autoPrint || !html) return
    const timeoutId = window.setTimeout(() => {
      if (printed.current) return
      printed.current = true
      printHtml(html)
    }, 400)
    return () => window.clearTimeout(timeoutId)
  }, [configReady, autoPrint, html])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Ticket de venta"
      description="La venta ya está registrada. En el cuadro de impresión elegí la impresora térmica."
      className="max-w-lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button type="button" onClick={() => html && printHtml(html)} disabled={!html}>
            Imprimir
          </Button>
        </div>
      }
    >
      {ticketQuery.isLoading ? (
        <p className="py-16 text-center text-sm font-medium">Cargando ticket…</p>
      ) : null}
      {ticketQuery.isError ? (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar el ticket</p>
          <p className="mt-1 text-sm text-muted">{getApiErrorMessage(ticketQuery.error)}</p>
          <Button type="button" className="mt-4" onClick={() => void ticketQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : null}
      {settings && html ? <TicketPreview html={html} paperMm={settings.paperMm} /> : null}
    </Dialog>
  )
}
