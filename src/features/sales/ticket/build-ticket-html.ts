import type { Venta } from '@/features/sales/types'
import { paymentMethodLabel } from '@/features/sales/utils/sale-labels'
import type { TicketSettings } from '@/features/sales/ticket/ticket-settings'
import { formatComprobante, formatDateTime, formatMoney } from '@/lib/utils/format'

export type TicketPrintInput = {
  sale: Venta
  settings: TicketSettings
  cashReceived?: number
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function money(value: number | string) {
  return escapeHtml(formatMoney(value))
}

export function buildTicketHtml({ sale, settings, cashReceived }: TicketPrintInput) {
  const paper = settings.paperMm
  const fontSize = paper <= 48 ? 10 : paper <= 58 ? 11 : 12
  const comercio = settings.comercio.trim() || 'Control de stock'
  const articles =
    sale.items?.reduce((sum, item) => sum + Number(item.cantidad || 0), 0) ?? 0
  const showCash =
    sale.metodoPago === 'EFECTIVO' &&
    cashReceived != null &&
    Number.isFinite(cashReceived)
  const change = showCash ? Number((cashReceived - Number(sale.total)).toFixed(2)) : null

  const headerLines = [settings.direccion, settings.telefono && `Tel. ${settings.telefono}`, settings.cuit && `CUIT ${settings.cuit}`]
    .map((line) => line?.trim())
    .filter((line): line is string => Boolean(line))
    .map((line) => `<p class="center muted">${escapeHtml(line)}</p>`)
    .join('')

  const items = (sale.items ?? [])
    .map((item) => {
      const name = item.producto?.nombre?.trim() || 'Producto'
      const code = item.producto?.codigo?.trim()
      const quantity = escapeHtml(String(item.cantidad))
      return `<div class="item">
        <p>${escapeHtml(name)}</p>
        ${code ? `<p class="muted">${escapeHtml(code)}</p>` : ''}
        <div class="row">
          <span>${quantity} × ${money(item.precioUnitario)}</span>
          <span>${money(item.subtotal)}</span>
        </div>
      </div>`
    })
    .join('')

  const cashBlock =
    showCash && change != null && change >= 0
      ? `<div class="row"><span>Pago con</span><span>${money(cashReceived)}</span></div>
         <div class="row"><span>Vuelto</span><span>${money(change)}</span></div>`
      : showCash && change != null
        ? `<div class="row"><span>Pago con</span><span>${money(cashReceived)}</span></div>
           <p class="center">El pago no cubre el total</p>`
        : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ticket ${escapeHtml(formatComprobante(sale.numero))}</title>
  <style>
    @page { size: ${paper}mm auto; margin: 2mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${paper}mm;
      color: #111;
      background: #fff;
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: ${fontSize}px;
      line-height: 1.35;
    }
    body { padding: 2mm; }
    p { margin: 0; }
    .center { text-align: center; }
    .right { text-align: right; }
    .muted { color: #222; }
    .shop { font-size: ${fontSize + 3}px; font-weight: 700; letter-spacing: 0.02em; }
    .ticket-no { margin-top: 8px; font-weight: 700; letter-spacing: 0.08em; }
    .rule { border: 0; border-top: 1px dashed #111; margin: 8px 0; }
    .item { margin: 0 0 6px; }
    .item .right { font-variant-numeric: tabular-nums; }
    .row { display: flex; justify-content: space-between; gap: 8px; font-variant-numeric: tabular-nums; }
    .total { font-size: ${fontSize + 2}px; font-weight: 700; margin-top: 4px; }
    .footer { margin-top: 10px; }
    .legal {
      margin-top: 8px;
      font-size: ${Math.max(fontSize - 1, 9)}px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body>
  <header class="center">
    <p class="shop">${escapeHtml(comercio)}</p>
    ${headerLines}
  </header>
  <p class="center ticket-no">TICKET ${escapeHtml(formatComprobante(sale.numero))}</p>
  <p class="center">${escapeHtml(formatDateTime(sale.createdAt))}</p>
  <p class="center">Cajero: ${escapeHtml(sale.usuario?.nombre ?? '—')}</p>
  <hr class="rule" />
  ${items || '<p class="center muted">Sin productos</p>'}
  <hr class="rule" />
  <div class="row"><span>Artículos</span><span>${articles}</span></div>
  <div class="row total"><span>TOTAL</span><span>${money(sale.total)}</span></div>
  <p class="center" style="margin-top:6px">${escapeHtml(paymentMethodLabel(sale.metodoPago))}</p>
  ${cashBlock}
  <hr class="rule" />
  <p class="center footer">${escapeHtml(settings.mensaje.trim() || 'Gracias por su compra')}</p>
  <p class="center legal">DOCUMENTO NO VALIDO COMO FACTURA</p>
</body>
</html>`
}
