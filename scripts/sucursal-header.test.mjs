/**
 * Pruebas del clasificador de header x-sucursal-id y de la resolución inicial.
 * Ejecutar: node --test scripts/sucursal-header.test.mjs
 */

import assert from 'node:assert/strict'
import test from 'node:test'

/** Réplica mínima de resolveSucursalHeaderMode (mantener alineada con src/lib/api/sucursal-header.ts). */
function normalizePath(url) {
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

function resolveSucursalHeaderMode(method, url) {
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

  if (m === 'get' && /^\/venta\/\d+$/.test(path)) return 'never'
  if (m === 'post' && /^\/venta\/\d+\/cancelar$/.test(path)) return 'never'
  if (m === 'get' && /^\/compra\/\d+$/.test(path)) return 'never'
  if (m === 'get' && /^\/caja\/\d+$/.test(path)) return 'never'
  if (m === 'post' && /^\/caja\/\d+\/cerrar$/.test(path)) return 'never'
  if (m === 'get' && /^\/caja\/\d+\/movimientos$/.test(path)) return 'never'
  if (m === 'delete' && /^\/producto\/\d+$/.test(path)) return 'never'

  if (path.startsWith('/reporte')) return 'optional'
  if (m === 'get' && (path === '/producto/search' || /^\/producto\/\d+$/.test(path))) {
    return 'optional'
  }
  if (m === 'patch' && /^\/producto\/\d+$/.test(path)) return 'optional'

  if (path.startsWith('/inventario')) return 'required'
  if (path === '/venta' || path === '/venta/search') return 'required'
  if (path.startsWith('/compra')) return 'required'
  if (path.startsWith('/caja')) return 'required'
  if (m === 'post' && (path === '/producto' || path === '/producto/bulk')) return 'required'

  return 'never'
}

const CASA_CENTRAL_CODIGO = 'CASA-CENTRAL'

function pickInitialSucursal(available, preferredId) {
  if (available.length === 0) return null
  if (preferredId != null) {
    const preferred = available.find((item) => item.id === preferredId)
    if (preferred) return preferred
  }
  if (available.length === 1) return available[0]
  const casaCentral = available.find((item) => item.codigo === CASA_CENTRAL_CODIGO)
  return casaCentral ?? available[0]
}

function productListKey(sucursalId, params) {
  return ['products', 'list', sucursalId, params]
}

test('transferencias nunca envían header', () => {
  assert.equal(resolveSucursalHeaderMode('get', '/transferencia/search'), 'never')
  assert.equal(resolveSucursalHeaderMode('post', '/transferencia'), 'never')
  assert.equal(resolveSucursalHeaderMode('post', '/transferencia/3/confirmar'), 'never')
})

test('sucursales y auth nunca envían header', () => {
  assert.equal(resolveSucursalHeaderMode('get', '/sucursal/me'), 'never')
  assert.equal(resolveSucursalHeaderMode('post', '/auth/login'), 'never')
})

test('inventario, ventas y caja requieren header', () => {
  assert.equal(resolveSucursalHeaderMode('get', '/inventario/search'), 'required')
  assert.equal(resolveSucursalHeaderMode('post', '/venta'), 'required')
  assert.equal(resolveSucursalHeaderMode('get', '/venta/search'), 'required')
  assert.equal(resolveSucursalHeaderMode('get', '/caja/activa'), 'required')
  assert.equal(resolveSucursalHeaderMode('post', '/caja/abrir'), 'required')
})

test('detalle de venta/compra y cancelar venta no usan header', () => {
  assert.equal(resolveSucursalHeaderMode('get', '/venta/12'), 'never')
  assert.equal(resolveSucursalHeaderMode('post', '/venta/12/cancelar'), 'never')
  assert.equal(resolveSucursalHeaderMode('get', '/compra/9'), 'never')
})

test('reportes y productos son opcionales', () => {
  assert.equal(resolveSucursalHeaderMode('get', '/reporte/ventas'), 'optional')
  assert.equal(resolveSucursalHeaderMode('get', '/producto/search'), 'optional')
  assert.equal(resolveSucursalHeaderMode('get', '/producto/4'), 'optional')
})

test('normaliza URL absoluta del cliente Axios', () => {
  assert.equal(
    resolveSucursalHeaderMode('get', 'http://localhost:3000/inventario/search?q=a'),
    'required',
  )
  assert.equal(
    resolveSucursalHeaderMode('get', 'http://localhost:3000/transferencia/1'),
    'never',
  )
})

test('pickInitialSucursal respeta preferencia válida', () => {
  const list = [
    { id: 1, codigo: 'CASA-CENTRAL', nombre: 'Casa' },
    { id: 2, codigo: 'NORTE', nombre: 'Norte' },
  ]
  assert.equal(pickInitialSucursal(list, 2)?.id, 2)
})

test('pickInitialSucursal cae a Casa Central si la preferencia no está', () => {
  const list = [
    { id: 1, codigo: 'CASA-CENTRAL', nombre: 'Casa' },
    { id: 2, codigo: 'NORTE', nombre: 'Norte' },
  ]
  assert.equal(pickInitialSucursal(list, 99)?.id, 1)
})

test('pickInitialSucursal con una sola disponible la selecciona', () => {
  const list = [{ id: 7, codigo: 'SUR', nombre: 'Sur' }]
  assert.equal(pickInitialSucursal(list, null)?.id, 7)
})

test('query keys de productos aíslan por sucursal', () => {
  const a = productListKey(1, { q: 'agua' })
  const b = productListKey(2, { q: 'agua' })
  assert.notDeepEqual(a, b)
  assert.deepEqual(a[2], 1)
  assert.deepEqual(b[2], 2)
})
