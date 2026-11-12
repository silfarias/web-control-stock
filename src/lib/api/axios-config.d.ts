import 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * No enviar `x-sucursal-id` aunque el endpoint lo admita (p. ej. reportes consolidados).
     */
    skipSucursalHeader?: boolean
  }
}
