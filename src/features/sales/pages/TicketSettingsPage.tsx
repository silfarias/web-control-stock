import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { buildTicketHtml } from '@/features/sales/ticket/build-ticket-html'
import { sampleTicketCashReceived, sampleTicketSale } from '@/features/sales/ticket/sample-ticket'
import { TicketPreview } from '@/features/sales/ticket/TicketPreview'
import { TicketSettingsDialog } from '@/features/sales/ticket/TicketSettingsDialog'
import { toTicketSettings } from '@/features/sales/ticket/ticket-settings'
import { useTicketConfig } from '@/features/sales/ticket/use-ticket'
import { getApiErrorMessage } from '@/lib/api/errors'

export function TicketSettingsPage() {
  const ticketQuery = useTicketConfig()
  const [open, setOpen] = useState(false)
  const settings = ticketQuery.data ? toTicketSettings(ticketQuery.data) : null

  const html = useMemo(
    () =>
      settings
        ? buildTicketHtml({
            sale: sampleTicketSale,
            settings,
            cashReceived: sampleTicketCashReceived,
          })
        : '',
    [settings],
  )

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-muted">
          Así se ve el ticket con la configuración actual. Los cambios se usan en cada venta.
        </p>
        <Button
          type="button"
          className="shrink-0 self-start"
          disabled={!settings}
          onClick={() => setOpen(true)}
        >
          Configurar
        </Button>
      </div>

      {ticketQuery.isLoading ? (
        <Card className="px-6 py-16 text-center">
          <p className="text-sm font-medium">Cargando ticket…</p>
          <p className="mt-1 text-sm text-muted">Un momento, por favor.</p>
        </Card>
      ) : null}

      {ticketQuery.isError ? (
        <Card className="border-error/20 bg-error-soft px-6 py-10 text-center">
          <p className="text-sm font-semibold text-error-ink">No se pudo cargar el ticket</p>
          <p className="mt-1 text-sm text-error-ink/90">{getApiErrorMessage(ticketQuery.error)}</p>
          <div className="mt-5 flex justify-center">
            <Button type="button" onClick={() => void ticketQuery.refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : null}

      {settings && html ? <TicketPreview html={html} paperMm={settings.paperMm} /> : null}

      {settings ? (
        <TicketSettingsDialog open={open} settings={settings} onOpenChange={setOpen} />
      ) : null}
    </div>
  )
}
