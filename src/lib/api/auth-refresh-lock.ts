/** Lógica pura del lock de refresh (testeable sin DOM). */

export type RefreshLockPayload = {
  ts: number
  owner: string
}

export function parseRefreshLock(raw: string | null): RefreshLockPayload | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { ts?: unknown; owner?: unknown }
    if (typeof parsed.ts !== 'number' || typeof parsed.owner !== 'string' || !parsed.owner) {
      return null
    }
    return { ts: parsed.ts, owner: parsed.owner }
  } catch {
    return null
  }
}

export function isRefreshLockHeldByOther(
  lock: RefreshLockPayload | null,
  now: number,
  ttlMs: number,
  tabId: string,
): boolean {
  if (!lock) return false
  if (lock.owner === tabId) return false
  return now - lock.ts < ttlMs
}

export function createRefreshLockPayload(tabId: string, now: number): RefreshLockPayload {
  return { ts: now, owner: tabId }
}
