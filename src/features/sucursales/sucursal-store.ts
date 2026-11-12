/**
 * Sucursal operativa en memoria para el interceptor HTTP.
 * El React Context sincroniza este valor; no es estado de UI.
 */
let operativeSucursalId: number | null = null

export const sucursalStore = {
  getId() {
    return operativeSucursalId
  },

  setId(id: number | null) {
    operativeSucursalId = id != null && id > 0 ? id : null
  },

  clear() {
    operativeSucursalId = null
  },
}
