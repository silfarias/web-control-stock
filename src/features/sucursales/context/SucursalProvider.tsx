import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { sucursalKeys } from '@/features/sucursales/api/query-keys'
import { sucursalesApi } from '@/features/sucursales/api/sucursales-api'
import { SucursalContext } from '@/features/sucursales/context/sucursal-context'
import {
  clearStoredSucursalId,
  getStoredSucursalId,
  storeSucursalId,
} from '@/features/sucursales/sucursal-storage'
import { sucursalStore } from '@/features/sucursales/sucursal-store'
import type { Sucursal, SucursalStatus } from '@/features/sucursales/types'
import { pickInitialSucursal } from '@/features/sucursales/utils/resolve-sucursal'
import { getApiErrorMessage } from '@/lib/api/errors'

export function SucursalProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<SucursalStatus>('idle')
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [sucursalId, setSucursalIdState] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const userIdRef = useRef<number | null>(null)
  const sucursalIdRef = useRef<number | null>(null)
  const previousSucursalId = useRef<number | null>(null)
  const statusRef = useRef<SucursalStatus>('idle')

  useEffect(() => {
    sucursalIdRef.current = sucursalId
  }, [sucursalId])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  const applySelection = useCallback(
    (nextId: number | null, list: Sucursal[], options?: { persist?: boolean }) => {
      const selected = list.find((item) => item.id === nextId) ?? null
      const resolvedId = selected?.id ?? null
      setSucursalIdState(resolvedId)
      sucursalStore.setId(resolvedId)

      const persist = options?.persist ?? true
      if (!persist) return
      if (resolvedId != null) storeSucursalId(resolvedId)
      else clearStoredSucursalId()
    },
    [],
  )

  const loadMine = useCallback(
    async (mode: 'full' | 'soft' = 'full') => {
      const soft = mode === 'soft' && statusRef.current === 'ready'
      if (!soft) {
        setStatus('loading')
        setError(null)
      }

      try {
        const list = await sucursalesApi.me()
        const active = list.filter((item) => item.activo)
        const previousId = soft ? sucursalIdRef.current : null
        setSucursales(active)

        if (active.length === 0) {
          applySelection(null, [], { persist: false })
          setStatus('empty')
          return
        }

        const preferred = previousId ?? getStoredSucursalId()
        const picked = pickInitialSucursal(active, preferred)
        applySelection(picked?.id ?? null, active)

        if (preferred != null && picked?.id !== preferred) {
          if (picked) storeSucursalId(picked.id)
          else clearStoredSucursalId()
        }

        setStatus('ready')
        setError(null)
      } catch (err) {
        if (soft) {
          setError(getApiErrorMessage(err))
          return
        }
        setSucursales([])
        applySelection(null, [], { persist: false })
        setError(getApiErrorMessage(err))
        setStatus('error')
      }
    },
    [applySelection],
  )

  const refetch = useCallback(() => loadMine('soft'), [loadMine])

  const resetSessionState = useCallback(() => {
    setSucursales([])
    setSucursalIdState(null)
    setError(null)
    setStatus('idle')
  }, [])

  useEffect(() => {
    if (isBootstrapping) return

    if (!isAuthenticated || !user) {
      userIdRef.current = null
      sucursalStore.clear()
      // Conservar preferencia en localStorage para validarla en el próximo login.
      void queryClient.removeQueries({ queryKey: sucursalKeys.all })
      queueMicrotask(() => {
        resetSessionState()
      })
      return
    }

    if (userIdRef.current !== user.id) {
      userIdRef.current = user.id
      void loadMine('full')
    }
  }, [isAuthenticated, isBootstrapping, loadMine, queryClient, resetSessionState, user])

  const setSucursalId = useCallback(
    (id: number) => {
      if (!sucursales.some((item) => item.id === id)) return
      if (id === sucursalId) return

      const previous = sucursalId
      applySelection(id, sucursales)
      setStatus('ready')

      void queryClient.cancelQueries()
      if (previous != null) {
        void queryClient.removeQueries({
          predicate: (query) => query.queryKey.includes(previous),
        })
      }
    },
    [applySelection, queryClient, sucursalId, sucursales],
  )

  useEffect(() => {
    if (previousSucursalId.current === sucursalId) return
    previousSucursalId.current = sucursalId
  }, [sucursalId])

  const sucursal = useMemo(
    () => sucursales.find((item) => item.id === sucursalId) ?? null,
    [sucursalId, sucursales],
  )

  const value = useMemo(
    () => ({
      status,
      sucursales,
      sucursal,
      sucursalId,
      isReady: status === 'ready' && sucursalId != null,
      isLoading: status === 'loading' || (isAuthenticated && status === 'idle'),
      error,
      setSucursalId,
      refetch,
    }),
    [
      status,
      sucursales,
      sucursal,
      sucursalId,
      isAuthenticated,
      error,
      setSucursalId,
      refetch,
    ],
  )

  return <SucursalContext.Provider value={value}>{children}</SucursalContext.Provider>
}
