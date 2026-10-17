import axios from 'axios'

export type ApiErrorBody = {
  error?: boolean
  errorDetails?: {
    code?: string
    message?: string
  }
  message?: string | string[]
  statusCode?: number
}

export class ApiError extends Error {
  readonly status?: number
  readonly code?: string
  readonly isNetworkError: boolean

  constructor(options: {
    message: string
    status?: number
    code?: string
    isNetworkError?: boolean
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.status = options.status
    this.code = options.code
    this.isNetworkError = options.isNetworkError ?? false
  }
}

function messageFromBody(data: unknown): { message: string; code?: string } {
  if (!data || typeof data !== 'object') {
    return { message: 'Ocurrió un error inesperado.' }
  }

  const body = data as ApiErrorBody

  if (body.errorDetails?.message) {
    return {
      message: body.errorDetails.message,
      code: body.errorDetails.code,
    }
  }

  if (typeof body.message === 'string' && body.message.trim()) {
    return { message: body.message }
  }

  if (Array.isArray(body.message) && body.message.length > 0) {
    return { message: body.message.join('. ') }
  }

  return { message: 'Ocurrió un error inesperado.' }
}

export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError({
        message: 'No se pudo conectar con el servidor. Verificá tu conexión.',
        isNetworkError: true,
      })
    }

    const { message, code } = messageFromBody(error.response.data)
    return new ApiError({
      message,
      status: error.response.status,
      code,
    })
  }

  if (error instanceof Error && error.message) {
    return new ApiError({ message: error.message })
  }

  return new ApiError({ message: 'Ocurrió un error inesperado.' })
}

export function getApiErrorMessage(error: unknown): string {
  const apiError = normalizeApiError(error)

  if (apiError.isNetworkError) {
    return apiError.message
  }

  if (apiError.code === 'AU01') {
    return 'Email o contraseña incorrectos.'
  }

  if (
    apiError.status === 401 ||
    apiError.code === 'SE03' ||
    apiError.code === 'SE04' ||
    apiError.code === 'SE05'
  ) {
    return 'Tu sesión expiró o no es válida. Volvé a iniciar sesión.'
  }

  if (apiError.status === 403) {
    return 'No tenés permiso para realizar esta acción.'
  }

  if (apiError.code === 'IN01') {
    return apiError.message || 'Stock insuficiente para realizar el movimiento.'
  }

  if (apiError.code === 'IN02') {
    return apiError.message || 'No se encontró stock para el producto indicado.'
  }

  if (apiError.code === 'VE01') {
    return apiError.message || 'La venta debe tener al menos un ítem.'
  }

  if (apiError.code === 'CJ01') {
    return apiError.message || 'Ya existe una caja abierta.'
  }

  if (apiError.code === 'CJ02') {
    return apiError.message || 'No hay una caja abierta.'
  }

  if (apiError.code === 'CJ03') {
    return apiError.message || 'La caja ya está cerrada.'
  }

  if (apiError.status === 404) {
    return 'No se encontró el registro solicitado.'
  }

  if (apiError.status === 409) {
    return apiError.message || 'Ya existe un registro con esos datos.'
  }

  if (apiError.status && apiError.status >= 500) {
    return 'El servidor no pudo procesar la solicitud. Intentá de nuevo más tarde.'
  }

  return apiError.message
}

/** Mensaje extra cuando una mutación puede haberse completado pese al fallo de red. */
export function getUncertainMutationHint(error: unknown): string | null {
  const apiError = normalizeApiError(error)
  if (!apiError.isNetworkError) return null
  return 'Si la operación pudo haberse registrado, consultá el listado antes de volver a enviar.'
}

export function getAuthErrorMessage(error: unknown): string {
  if (normalizeApiError(error).code === 'AU01') {
    return 'Email o contraseña incorrectos.'
  }
  return getApiErrorMessage(error)
}
