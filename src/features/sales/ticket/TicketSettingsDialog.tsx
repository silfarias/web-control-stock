import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useToast } from '@/components/common/use-toast'
import { buildTicketHtml } from '@/features/sales/ticket/build-ticket-html'
import { sampleTicketCashReceived, sampleTicketSale } from '@/features/sales/ticket/sample-ticket'
import { TicketPreview } from '@/features/sales/ticket/TicketPreview'
import { useUpdateTicket } from '@/features/sales/ticket/use-ticket'
import {
  TICKET_PAPER_WIDTHS,
  ticketPatch,
  type TicketPaperMm,
  type TicketSettings,
} from '@/features/sales/ticket/ticket-settings'
import { getApiErrorMessage, normalizeApiError } from '@/lib/api/errors'

type TicketSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: TicketSettings
}

export function TicketSettingsDialog({ open, onOpenChange, settings }: TicketSettingsDialogProps) {
  const updateTicket = useUpdateTicket()
  const { pushToast } = useToast()
  const [draft, setDraft] = useState(settings)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    if (!open) return
    setDraft(settingsRef.current)
  }, [open])

  const html = useMemo(
    () =>
      buildTicketHtml({
        sale: sampleTicketSale,
        settings: draft,
        cashReceived: sampleTicketCashReceived,
      }),
    [draft],
  )

  function update(patch: Partial<TicketSettings>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  async function save() {
    const patch = ticketPatch(settings, draft)
    if (Object.keys(patch).length === 0) {
      onOpenChange(false)
      return
    }
    if (patch.paperMm != null && !TICKET_PAPER_WIDTHS.includes(patch.paperMm)) {
      pushToast({
        tone: 'error',
        title: 'No se pudo guardar el ticket',
        description: 'El ancho de papel debe ser 48, 58, 80 o 90 mm.',
      })
      return
    }
    try {
      await updateTicket.mutateAsync(patch)
      onOpenChange(false)
    } catch (error) {
      if (normalizeApiError(error).code === 'TK01') {
        setDraft((current) => ({ ...current, paperMm: settings.paperMm }))
      }
      pushToast({
        tone: 'error',
        title: 'No se pudo guardar el ticket',
        description: getApiErrorMessage(error),
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configurar ticket"
      description="Estos datos se usan en cada ticket que se imprime."
      className="max-w-4xl"
      footer={
        <div className="flex items-center justify-end gap-3">
          {updateTicket.isPending ? <p className="text-sm text-muted">Guardando…</p> : null}
          <Button type="button" onClick={() => void save()} disabled={updateTicket.isPending}>
            Listo
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Ancho de papel</span>
            <Select
              value={String(draft.paperMm)}
              onValueChange={(value) => update({ paperMm: Number(value) as TicketPaperMm })}
            >
              <SelectTrigger aria-label="Ancho de papel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_PAPER_WIDTHS.map((width) => (
                  <SelectItem key={width} value={String(width)}>
                    {width} mm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            label="Comercio"
            value={draft.comercio}
            placeholder="Control de stock"
            onChange={(event) => update({ comercio: event.target.value })}
          />
          <Input
            label="Dirección"
            value={draft.direccion}
            onChange={(event) => update({ direccion: event.target.value })}
          />
          <Input
            label="Teléfono"
            value={draft.telefono}
            onChange={(event) => update({ telefono: event.target.value })}
          />
          <Input
            label="CUIT"
            value={draft.cuit}
            onChange={(event) => update({ cuit: event.target.value })}
          />
          <Input
            label="Mensaje final"
            value={draft.mensaje}
            onChange={(event) => update({ mensaje: event.target.value })}
          />
        </div>
        <TicketPreview html={html} paperMm={draft.paperMm} />
      </div>
    </Dialog>
  )
}
