import type { SearchParams } from '@/lib/api/types'

export type EstadoCaja = 'ABIERTA' | 'CERRADA'

export type TipoMovimientoCaja = 'VENTA' | 'INGRESO' | 'EGRESO'

export type CajaUsuario = {
  id: number
  nombre: string
  email: string
  role?: string
}

export type Caja = {
  id: number
  montoApertura: number | string
  montoCierre?: number | string | null
  montoEsperado?: number | string | null
  abiertaEn: string
  cerradaEn?: string | null
  estado: EstadoCaja
  usuario: CajaUsuario
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type MovimientoCaja = {
  id: number
  tipo: TipoMovimientoCaja
  monto: number | string
  descripcion?: string | null
  referenciaId?: number | null
  usuario: CajaUsuario
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export type AbrirCajaRequest = {
  montoApertura: number
}

export type CerrarCajaRequest = {
  montoCierre: number
}

/** Solo INGRESO/EGRESO: VENTA se genera desde ventas en efectivo. */
export type TipoMovimientoCajaManual = 'INGRESO' | 'EGRESO'

export type CreateMovimientoCajaRequest = {
  tipo: TipoMovimientoCajaManual
  monto: number
  descripcion: string
  referenciaId?: number
}

export type CierreCajaResponse = {
  caja: Caja
  montoEsperado: number | string
  montoCierre: number | string
  diferencia: number | string
}

export type SearchCajasParams = SearchParams & {
  id?: number
  usuarioId?: number
  estado?: EstadoCaja
}

export type SearchMovimientosCajaParams = SearchParams & {
  id?: number
  cajaId?: number
  tipo?: TipoMovimientoCaja
}
