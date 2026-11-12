const STORAGE_KEY = 'wcs.sucursal-id'

export function getStoredSucursalId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  } catch {
    return null
  }
}

export function storeSucursalId(id: number | null) {
  try {
    if (id == null) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, String(id))
  } catch {
    // ignore
  }
}

export function clearStoredSucursalId() {
  storeSucursalId(null)
}
