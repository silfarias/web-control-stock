export const TICKET_PAPER_WIDTHS = [48, 58, 80, 90] as const

export type TicketPaperMm = (typeof TICKET_PAPER_WIDTHS)[number]

export type SaleTicketNavigationState = {
  printTicket?: boolean
  cashReceived?: number
}

export type TicketSettings = {
  paperMm: TicketPaperMm
  comercio: string
  direccion: string
  telefono: string
  cuit: string
  mensaje: string
}

export type TicketConfig = TicketSettings & {
  id: number
  createdAt: string
  updatedAt: string
}

export type UpdateTicketRequest = Partial<TicketSettings>

const CASH_KEY = 'stock-ticket-cash'

export const defaultTicketSettings: TicketSettings = {
  paperMm: 80,
  comercio: '',
  direccion: '',
  telefono: '',
  cuit: '',
  mensaje: 'Gracias por su compra',
}

export function isPaper(value: unknown): value is TicketPaperMm {
  return TICKET_PAPER_WIDTHS.includes(value as TicketPaperMm)
}

function text(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function toTicketSettings(ticket: Partial<TicketConfig> | null | undefined): TicketSettings {
  return {
    paperMm: isPaper(ticket?.paperMm) ? ticket.paperMm : defaultTicketSettings.paperMm,
    comercio: text(ticket?.comercio),
    direccion: text(ticket?.direccion),
    telefono: text(ticket?.telefono),
    cuit: text(ticket?.cuit),
    mensaje: text(ticket?.mensaje),
  }
}

export function normalizeTicketSettings(settings: TicketSettings): TicketSettings {
  return {
    paperMm: settings.paperMm,
    comercio: settings.comercio.trim(),
    direccion: settings.direccion.trim(),
    telefono: settings.telefono.trim(),
    cuit: settings.cuit.trim(),
    mensaje: settings.mensaje.trim(),
  }
}

export function ticketPatch(saved: TicketSettings, draft: TicketSettings): UpdateTicketRequest {
  const next = normalizeTicketSettings(draft)
  const patch: UpdateTicketRequest = {}
  if (next.paperMm !== saved.paperMm) patch.paperMm = next.paperMm
  if (next.comercio !== saved.comercio) patch.comercio = next.comercio
  if (next.direccion !== saved.direccion) patch.direccion = next.direccion
  if (next.telefono !== saved.telefono) patch.telefono = next.telefono
  if (next.cuit !== saved.cuit) patch.cuit = next.cuit
  if (next.mensaje !== saved.mensaje) patch.mensaje = next.mensaje
  return patch
}

export function rememberTicketCash(saleId: number, amount: number) {
  if (!Number.isFinite(amount)) return
  const current = readCashMap()
  current[String(saleId)] = amount
  localStorage.setItem(CASH_KEY, JSON.stringify(current))
}

export function readTicketCash(saleId: number): number | undefined {
  const amount = readCashMap()[String(saleId)]
  return typeof amount === 'number' && Number.isFinite(amount) ? amount : undefined
}

function readCashMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(CASH_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const next: Record<string, number> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'number' && Number.isFinite(value)) next[key] = value
    }
    return next
  } catch {
    return {}
  }
}
