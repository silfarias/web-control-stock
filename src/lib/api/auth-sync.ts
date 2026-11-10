/**
 * Coordinación liviana entre pestañas para refresh rotativo.
 * El refresh token vive en sessionStorage (por pestaña); al duplicar una pestaña
 * puede haber el mismo token en dos contextos → hay que evitar refresh paralelo.
 *
 * Los tokens se comparten por BroadcastChannel solo entre pestañas del mismo origen
 * para sincronizar tras un refresh exitoso. No se registran en consola.
 */

import {
  createRefreshLockPayload,
  isRefreshLockHeldByOther,
  parseRefreshLock,
} from '@/lib/api/auth-refresh-lock'

const CHANNEL_NAME = 'wcs.auth'
const LOCK_KEY = 'wcs.refresh_lock'
/** TTL del lock; si la pestaña muere a mitad de un refresh, el lock caduca. */
export const REFRESH_LOCK_TTL_MS = 10_000
/** Esperar al peer al menos el TTL del lock (+ margen) para poder robar locks muertos. */
export const PEER_WAIT_MS = REFRESH_LOCK_TTL_MS + 1_000

export type AuthSyncTokens = {
  accessToken: string
  refreshToken: string
}

type AuthSyncMessage =
  | { type: 'refreshing'; owner: string }
  | { type: 'tokens'; owner: string; tokens: AuthSyncTokens }
  | { type: 'session-cleared'; owner: string }

type TokensListener = (tokens: AuthSyncTokens) => void
type ClearedListener = () => void

const tabId =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`

let channel: BroadcastChannel | null = null
let unloadHookInstalled = false
const tokenListeners = new Set<TokensListener>()
const clearedListeners = new Set<ClearedListener>()

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function ensureUnloadHook() {
  if (unloadHookInstalled || typeof window === 'undefined') return
  unloadHookInstalled = true
  // Si la pestaña se cierra a mitad del refresh, liberar el lock para no bloquear peers.
  window.addEventListener('pagehide', () => {
    releaseRefreshLock()
  })
}

function getChannel() {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null
  }
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME)
    channel.addEventListener('message', (event: MessageEvent<AuthSyncMessage>) => {
      const message = event.data
      if (!message || typeof message !== 'object') return
      if (message.owner === tabId) return

      if (message.type === 'tokens') {
        for (const listener of tokenListeners) listener(message.tokens)
        return
      }

      if (message.type === 'session-cleared') {
        for (const listener of clearedListeners) listener()
      }
    })
  }
  return channel
}

function post(message: AuthSyncMessage) {
  getChannel()?.postMessage(message)
}

export function onPeerTokens(listener: TokensListener) {
  getChannel()
  tokenListeners.add(listener)
  return () => {
    tokenListeners.delete(listener)
  }
}

export function onPeerSessionCleared(listener: ClearedListener) {
  getChannel()
  clearedListeners.add(listener)
  return () => {
    clearedListeners.delete(listener)
  }
}

export function broadcastTokens(tokens: AuthSyncTokens) {
  post({ type: 'tokens', owner: tabId, tokens })
}

export function broadcastSessionCleared() {
  post({ type: 'session-cleared', owner: tabId })
}

export function broadcastRefreshing() {
  post({ type: 'refreshing', owner: tabId })
}

export function tryAcquireRefreshLock(): boolean {
  ensureUnloadHook()
  if (!canUseLocalStorage()) return true

  const now = Date.now()
  try {
    const lock = parseRefreshLock(window.localStorage.getItem(LOCK_KEY))
    if (isRefreshLockHeldByOther(lock, now, REFRESH_LOCK_TTL_MS, tabId)) {
      return false
    }
    window.localStorage.setItem(
      LOCK_KEY,
      JSON.stringify(createRefreshLockPayload(tabId, now)),
    )
    return true
  } catch {
    return true
  }
}

export function releaseRefreshLock() {
  if (!canUseLocalStorage()) return
  try {
    const lock = parseRefreshLock(window.localStorage.getItem(LOCK_KEY))
    if (lock?.owner === tabId) {
      window.localStorage.removeItem(LOCK_KEY)
    }
  } catch {
    // ignore
  }
}

export function isRefreshLockBusy(): boolean {
  if (!canUseLocalStorage()) return false
  try {
    const lock = parseRefreshLock(window.localStorage.getItem(LOCK_KEY))
    return isRefreshLockHeldByOther(lock, Date.now(), REFRESH_LOCK_TTL_MS, tabId)
  } catch {
    return false
  }
}

/**
 * Espera tokens de otra pestaña. Si el mensaje llegó justo antes de suscribirse,
 * el caller debe comprobar `tokenStore` tras el timeout (ver refreshSession).
 */
export function waitForPeerTokens(): Promise<AuthSyncTokens> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      cleanup()
      reject(new Error('Timeout esperando renovación de sesión en otra pestaña.'))
    }, PEER_WAIT_MS)

    const unsubscribeTokens = onPeerTokens((tokens) => {
      cleanup()
      resolve(tokens)
    })

    const unsubscribeCleared = onPeerSessionCleared(() => {
      cleanup()
      reject(new Error('La sesión se invalidó en otra pestaña.'))
    })

    function cleanup() {
      window.clearTimeout(timeoutId)
      unsubscribeTokens()
      unsubscribeCleared()
    }
  })
}
