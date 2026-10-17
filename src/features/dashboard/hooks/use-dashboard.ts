import { useMemo } from 'react'
import { useActiveCashRegister } from '@/features/cash-register/hooks/use-cash-register'
import {
  addLocalDays,
  toLocalIsoDate,
} from '@/features/dashboard/utils/dashboard-dates'
import {
  buildSalesSeries,
  mapLowStockItems,
  mapRecentSales,
} from '@/features/dashboard/utils/map-dashboard-data'
import type {
  DashboardSummary,
  EmployeeDashboardSummary,
} from '@/features/dashboard/types'
import { useInventory } from '@/features/inventory/hooks/use-inventory'
import { useStockMovements } from '@/features/inventory/hooks/use-stock-movements'
import { useProducts } from '@/features/products/hooks/use-products'
import {
  useDailySalesReport,
  useLowStockReport,
  useSalesReport,
} from '@/features/reports/hooks/use-reports'
import { useSales } from '@/features/sales/hooks/use-sales'
import { useAuth } from '@/features/auth/hooks/use-auth'

const COUNT_PARAMS = {
  pageNumber: 1,
  pageSize: 1,
  orderBy: 'id',
  orderDirection: 'DESC' as const,
}

export function useDashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const today = useMemo(() => new Date(), [])
  const todayIso = toLocalIsoDate(today)
  const weekStartIso = addLocalDays(todayIso, -6)

  const todaySalesFiltro = useMemo(
    () => ({ desde: todayIso, hasta: todayIso }),
    [todayIso],
  )
  const weekSalesFiltro = useMemo(
    () => ({ desde: weekStartIso, hasta: todayIso }),
    [weekStartIso, todayIso],
  )

  const salesTodayQuery = useSalesReport(todaySalesFiltro, { enabled: isAdmin })
  const dailySalesQuery = useDailySalesReport(weekSalesFiltro, { enabled: isAdmin })
  const lowStockQuery = useLowStockReport({}, { enabled: isAdmin })

  const productsQuery = useProducts(COUNT_PARAMS)
  const movementsQuery = useStockMovements(COUNT_PARAMS, { enabled: isAdmin })
  const stockCountQuery = useInventory(COUNT_PARAMS, { enabled: !isAdmin })
  const salesTotalQuery = useSales(
    { ...COUNT_PARAMS, estado: 'CONFIRMADA' },
    { enabled: !isAdmin },
  )
  const recentSalesQuery = useSales({
    pageNumber: 1,
    pageSize: 6,
    orderBy: 'id',
    orderDirection: 'DESC',
    estado: 'CONFIRMADA',
  })
  const activeCashQuery = useActiveCashRegister()

  const adminSummary = useMemo<DashboardSummary | null>(() => {
    if (!isAdmin) return null
    if (
      salesTodayQuery.isLoading ||
      productsQuery.isLoading ||
      lowStockQuery.isLoading ||
      movementsQuery.isLoading
    ) {
      return null
    }

    const sales = salesTodayQuery.data
    const lowStockCount = lowStockQuery.data?.length ?? 0

    return {
      salesToday: sales?.totalIngresos ?? 0,
      salesDetail:
        sales != null
          ? `${sales.cantidadVentas} operación${sales.cantidadVentas === 1 ? '' : 'es'} en el día`
          : 'Sin datos',
      products: productsQuery.data?.metadata.count ?? 0,
      productsDetail: 'Productos registrados',
      lowStock: lowStockCount,
      lowStockDetail:
        lowStockCount === 0 ? 'Sin alertas de mínimo' : 'Por debajo del mínimo',
      movements: movementsQuery.data?.metadata.count ?? 0,
      movementsDetail: 'Movimientos de stock registrados',
    }
  }, [
    isAdmin,
    salesTodayQuery.isLoading,
    salesTodayQuery.data,
    productsQuery.isLoading,
    productsQuery.data,
    lowStockQuery.isLoading,
    lowStockQuery.data,
    movementsQuery.isLoading,
    movementsQuery.data,
  ])

  const employeeSummary = useMemo<EmployeeDashboardSummary | null>(() => {
    if (isAdmin) return null
    if (
      productsQuery.isLoading ||
      salesTotalQuery.isLoading ||
      stockCountQuery.isLoading ||
      activeCashQuery.isLoading
    ) {
      return null
    }

    const caja = activeCashQuery.data
    const cashOpen = caja?.estado === 'ABIERTA'

    return {
      cashLabel: cashOpen ? 'Caja abierta' : 'Sin caja abierta',
      cashDetail: cashOpen
        ? `Sesión #${caja.id}`
        : 'Podés consultar el módulo de caja',
      products: productsQuery.data?.metadata.count ?? 0,
      productsDetail: 'Productos registrados',
      salesTotal: salesTotalQuery.data?.metadata.count ?? 0,
      salesDetail: 'Ventas confirmadas (total)',
      stockRecords: stockCountQuery.data?.metadata.count ?? 0,
      stockDetail: 'Registros de inventario',
    }
  }, [
    isAdmin,
    productsQuery.isLoading,
    productsQuery.data,
    salesTotalQuery.isLoading,
    salesTotalQuery.data,
    stockCountQuery.isLoading,
    stockCountQuery.data,
    activeCashQuery.isLoading,
    activeCashQuery.data,
  ])

  const series = useMemo(() => {
    if (!isAdmin || !dailySalesQuery.data) return []
    return buildSalesSeries(dailySalesQuery.data, today)
  }, [isAdmin, dailySalesQuery.data, today])

  const lowStockItems = useMemo(
    () => (isAdmin && lowStockQuery.data ? mapLowStockItems(lowStockQuery.data) : []),
    [isAdmin, lowStockQuery.data],
  )

  const recentSales = useMemo(
    () => mapRecentSales(recentSalesQuery.data?.data ?? []),
    [recentSalesQuery.data],
  )

  const adminLoading =
    isAdmin &&
    (salesTodayQuery.isLoading ||
      dailySalesQuery.isLoading ||
      lowStockQuery.isLoading ||
      productsQuery.isLoading ||
      movementsQuery.isLoading ||
      recentSalesQuery.isLoading)

  const employeeLoading =
    !isAdmin &&
    (productsQuery.isLoading ||
      salesTotalQuery.isLoading ||
      stockCountQuery.isLoading ||
      activeCashQuery.isLoading ||
      recentSalesQuery.isLoading)

  const adminError =
    isAdmin &&
    (salesTodayQuery.isError ||
      dailySalesQuery.isError ||
      lowStockQuery.isError ||
      productsQuery.isError ||
      movementsQuery.isError ||
      recentSalesQuery.isError)

  const employeeError =
    !isAdmin &&
    (productsQuery.isError ||
      salesTotalQuery.isError ||
      stockCountQuery.isError ||
      activeCashQuery.isError ||
      recentSalesQuery.isError)

  function refetchAll() {
    if (isAdmin) {
      void salesTodayQuery.refetch()
      void dailySalesQuery.refetch()
      void lowStockQuery.refetch()
      void movementsQuery.refetch()
    } else {
      void salesTotalQuery.refetch()
      void stockCountQuery.refetch()
      void activeCashQuery.refetch()
    }
    void productsQuery.refetch()
    void recentSalesQuery.refetch()
  }

  return {
    isAdmin,
    today,
    adminSummary,
    employeeSummary,
    series,
    lowStockItems,
    recentSales,
    isLoading: adminLoading || employeeLoading,
    isError: adminError || employeeError,
    chartLoading: isAdmin && dailySalesQuery.isLoading,
    chartError: isAdmin && dailySalesQuery.isError,
    lowStockLoading: isAdmin && lowStockQuery.isLoading,
    lowStockError: isAdmin && lowStockQuery.isError,
    recentLoading: recentSalesQuery.isLoading,
    recentError: recentSalesQuery.isError,
    refetchAll,
  }
}
