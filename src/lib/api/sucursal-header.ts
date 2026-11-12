/**
 * Clasifica si una request debe llevar `x-sucursal-id`.
 * Fuente: api-control-stock/docs/multisucursal.md §2.
 */
export type SucursalHeaderMode = 'required' | 'optional' | 'never'

function normalizePath(url?: string) {
  if (!url) return ''
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).pathname.replace(/\/+$/, '') || '/'
    }
  } catch {
    // fall through
  }
  const path = url.split('?')[0] ?? ''
  return path.replace(/\/+$/, '') || '/'
}

export function resolveSucursalHeaderMode(
  method: string | undefined,
  url: string | undefined,
): SucursalHeaderMode {
  const path = normalizePath(url)
  const m = (method ?? 'get').toLowerCase()

  if (
    path.startsWith('/auth') ||
    path.startsWith('/sucursal') ||
    path.startsWith('/transferencia') ||
    path.startsWith('/categoria') ||
    path.startsWith('/proveedor') ||
    path.startsWith('/usuario') ||
    path.startsWith('/ticket')
  ) {
    return 'never'
  }

  // Lecturas / acciones cuya sucursal sale del recurso.
  if (m === 'get' && /^\/venta\/\d+$/.test(path)) return 'never'
  if (m === 'post' && /^\/venta\/\d+\/cancelar$/.test(path)) return 'never'
  if (m === 'get' && /^\/compra\/\d+$/.test(path)) return 'never'
  if (m === 'get' && /^\/caja\/\d+$/.test(path)) return 'never'
  if (m === 'post' && /^\/caja\/\d+\/cerrar$/.test(path)) return 'never'
  if (m === 'get' && /^\/caja\/\d+\/movimientos$/.test(path)) return 'never'
  if (m === 'delete' && /^\/producto\/\d+$/.test(path)) return 'never'

  // Reportes: opcional (con header = local; sin = consolidado).
  if (path.startsWith('/reporte')) return 'optional'

  // Productos: stockCantidad depende del header opcional.
  if (m === 'get' && (path === '/producto/search' || /^\/producto\/\d+$/.test(path))) {
    return 'optional'
  }
  if (m === 'patch' && /^\/producto\/\d+$/.test(path)) return 'optional'

  // Obligatorios por módulo.
  if (path.startsWith('/inventario')) return 'required'
  if (path === '/venta' || path === '/venta/search') return 'required'
  if (path.startsWith('/compra')) return 'required'
  if (path.startsWith('/caja')) return 'required'
  if (m === 'post' && (path === '/producto' || path === '/producto/bulk')) return 'required'

  return 'never'
}
