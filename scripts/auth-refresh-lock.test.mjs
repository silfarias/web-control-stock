/**
 * Pruebas mínimas del lock de refresh (Node built-in test runner).
 * Ejecutar: node --test scripts/auth-refresh-lock.test.mjs
 */

import assert from 'node:assert/strict'
import test from 'node:test'

function parseRefreshLock(raw) {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed.ts !== 'number' || typeof parsed.owner !== 'string' || !parsed.owner) {
      return null
    }
    return { ts: parsed.ts, owner: parsed.owner }
  } catch {
    return null
  }
}

function isRefreshLockHeldByOther(lock, now, ttlMs, tabId) {
  if (!lock) return false
  if (lock.owner === tabId) return false
  return now - lock.ts < ttlMs
}

test('parseRefreshLock acepta payload válido', () => {
  const lock = parseRefreshLock(JSON.stringify({ ts: 1000, owner: 'tab-a' }))
  assert.deepEqual(lock, { ts: 1000, owner: 'tab-a' })
})

test('parseRefreshLock rechaza JSON inválido', () => {
  assert.equal(parseRefreshLock('{'), null)
  assert.equal(parseRefreshLock(JSON.stringify({ ts: 'x', owner: 'a' })), null)
  assert.equal(parseRefreshLock(null), null)
})

test('lock ajeno vigente bloquea adquisición', () => {
  const lock = { ts: 1000, owner: 'tab-a' }
  assert.equal(isRefreshLockHeldByOther(lock, 1500, 10_000, 'tab-b'), true)
})

test('lock propio no bloquea (reentrada)', () => {
  const lock = { ts: 1000, owner: 'tab-a' }
  assert.equal(isRefreshLockHeldByOther(lock, 1500, 10_000, 'tab-a'), false)
})

test('lock ajeno expirado se puede robar', () => {
  const lock = { ts: 1000, owner: 'tab-a' }
  assert.equal(isRefreshLockHeldByOther(lock, 12_000, 10_000, 'tab-b'), false)
})
