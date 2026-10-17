import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppLayout } from '@/app/layouts/AppLayout'
import type { RouteHandle } from '@/app/router/route-handle'
import { NotFoundPage } from '@/components/common/NotFoundPage'
import { PlaceholderPage } from '@/components/common/PlaceholderPage'
import { navigation } from '@/components/navigation/nav-items'
import { GuestOnly } from '@/features/auth/components/GuestOnly'
import { RequireAdmin } from '@/features/auth/components/RequireAdmin'
import { RequireAuth } from '@/features/auth/components/RequireAuth'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { InventoryDetailPage } from '@/features/inventory/pages/InventoryDetailPage'
import { InventoryPage } from '@/features/inventory/pages/InventoryPage'
import { MovementsPage } from '@/features/inventory/pages/MovementsPage'
import { ProductCreatePage } from '@/features/products/pages/ProductCreatePage'
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage'
import { ProductEditPage } from '@/features/products/pages/ProductEditPage'
import { ProductsPage } from '@/features/products/pages/ProductsPage'
import { CashRegisterDetailPage } from '@/features/cash-register/pages/CashRegisterDetailPage'
import { CashRegisterPage } from '@/features/cash-register/pages/CashRegisterPage'
import { PurchaseCreatePage } from '@/features/purchases/pages/PurchaseCreatePage'
import { PurchaseDetailPage } from '@/features/purchases/pages/PurchaseDetailPage'
import { PurchaseEditPage } from '@/features/purchases/pages/PurchaseEditPage'
import { PurchasesPage } from '@/features/purchases/pages/PurchasesPage'
import { DailySalesReportPage } from '@/features/reports/pages/DailySalesReportPage'
import { InventoryReportPage } from '@/features/reports/pages/InventoryReportPage'
import { LowStockReportPage } from '@/features/reports/pages/LowStockReportPage'
import { ReportsHubPage } from '@/features/reports/pages/ReportsHubPage'
import { ReportsLayout } from '@/features/reports/pages/ReportsLayout'
import { SalesReportPage } from '@/features/reports/pages/SalesReportPage'
import { TopProductsReportPage } from '@/features/reports/pages/TopProductsReportPage'
import { SaleCreatePage } from '@/features/sales/pages/SaleCreatePage'
import { SaleDetailPage } from '@/features/sales/pages/SaleDetailPage'
import { SalesPage } from '@/features/sales/pages/SalesPage'
import { SuppliersPage } from '@/features/suppliers/pages/SuppliersPage'
import { UserDetailPage } from '@/features/users/pages/UserDetailPage'
import { UsersPage } from '@/features/users/pages/UsersPage'

const implementedPaths = new Set([
  '/',
  '/categorias',
  '/productos',
  '/inventario',
  '/proveedores',
  '/compras',
  '/caja',
  '/ventas',
  '/reportes',
  '/usuarios',
])

const placeholderRoutes = navigation
  .flatMap((section) => section.items)
  .filter((item) => !implementedPaths.has(item.to))
  .map((item) => ({
    path: item.to.slice(1),
    element: <PlaceholderPage />,
    handle: {
      title: item.title,
      breadcrumb: ['Inicio', item.title],
    } satisfies RouteHandle,
  }))

const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
        handle: { title: 'Iniciar sesión' } satisfies RouteHandle,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
            handle: { title: 'Panel' } satisfies RouteHandle,
          },
          {
            path: 'categorias',
            element: <CategoriesPage />,
            handle: {
              title: 'Categorías',
              breadcrumb: ['Inicio', 'Categorías'],
            } satisfies RouteHandle,
          },
          {
            path: 'productos',
            element: <ProductsPage />,
            handle: {
              title: 'Productos',
              breadcrumb: ['Inicio', 'Productos'],
            } satisfies RouteHandle,
          },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: 'productos/nuevo',
                element: <ProductCreatePage />,
                handle: {
                  title: 'Nuevo producto',
                  breadcrumb: ['Inicio', 'Productos', 'Nuevo'],
                } satisfies RouteHandle,
              },
              {
                path: 'productos/:id/editar',
                element: <ProductEditPage />,
                handle: {
                  title: 'Editar producto',
                  breadcrumb: ['Inicio', 'Productos', 'Editar'],
                } satisfies RouteHandle,
              },
              {
                path: 'compras/nueva',
                element: <PurchaseCreatePage />,
                handle: {
                  title: 'Nueva compra',
                  breadcrumb: ['Inicio', 'Compras', 'Nueva'],
                } satisfies RouteHandle,
              },
              {
                path: 'compras/:id/editar',
                element: <PurchaseEditPage />,
                handle: {
                  title: 'Editar compra',
                  breadcrumb: ['Inicio', 'Compras', 'Editar'],
                } satisfies RouteHandle,
              },
            ],
          },
          {
            path: 'productos/:id',
            element: <ProductDetailPage />,
            handle: {
              title: 'Detalle de producto',
              breadcrumb: ['Inicio', 'Productos', 'Detalle'],
            } satisfies RouteHandle,
          },
          {
            path: 'inventario',
            element: <InventoryPage />,
            handle: {
              title: 'Inventario',
              breadcrumb: ['Inicio', 'Inventario'],
            } satisfies RouteHandle,
          },
          {
            path: 'inventario/movimientos',
            element: <MovementsPage />,
            handle: {
              title: 'Movimientos de stock',
              breadcrumb: ['Inicio', 'Inventario', 'Movimientos'],
            } satisfies RouteHandle,
          },
          {
            path: 'inventario/:productoId',
            element: <InventoryDetailPage />,
            handle: {
              title: 'Detalle de inventario',
              breadcrumb: ['Inicio', 'Inventario', 'Detalle'],
            } satisfies RouteHandle,
          },
          {
            path: 'proveedores',
            element: <SuppliersPage />,
            handle: {
              title: 'Proveedores',
              breadcrumb: ['Inicio', 'Proveedores'],
            } satisfies RouteHandle,
          },
          {
            path: 'compras',
            element: <PurchasesPage />,
            handle: {
              title: 'Compras',
              breadcrumb: ['Inicio', 'Compras'],
            } satisfies RouteHandle,
          },
          {
            path: 'compras/:id',
            element: <PurchaseDetailPage />,
            handle: {
              title: 'Detalle de compra',
              breadcrumb: ['Inicio', 'Compras', 'Detalle'],
            } satisfies RouteHandle,
          },
          {
            path: 'caja',
            element: <CashRegisterPage />,
            handle: {
              title: 'Caja',
              breadcrumb: ['Inicio', 'Caja'],
            } satisfies RouteHandle,
          },
          {
            path: 'caja/:id',
            element: <CashRegisterDetailPage />,
            handle: {
              title: 'Detalle de caja',
              breadcrumb: ['Inicio', 'Caja', 'Detalle'],
            } satisfies RouteHandle,
          },
          {
            path: 'ventas',
            element: <SalesPage />,
            handle: {
              title: 'Ventas',
              breadcrumb: ['Inicio', 'Ventas'],
            } satisfies RouteHandle,
          },
          {
            path: 'ventas/nueva',
            element: <SaleCreatePage />,
            handle: {
              title: 'Nueva venta',
              breadcrumb: ['Inicio', 'Ventas', 'Nueva'],
            } satisfies RouteHandle,
          },
          {
            path: 'ventas/:id',
            element: <SaleDetailPage />,
            handle: {
              title: 'Detalle de venta',
              breadcrumb: ['Inicio', 'Ventas', 'Detalle'],
            } satisfies RouteHandle,
          },
          {
            element: <RequireAdmin />,
            children: [
              {
                path: 'reportes',
                element: <ReportsLayout />,
                handle: {
                  title: 'Reportes',
                  breadcrumb: ['Inicio', 'Reportes'],
                } satisfies RouteHandle,
                children: [
                  {
                    index: true,
                    element: <ReportsHubPage />,
                  },
                  {
                    path: 'ventas',
                    element: <SalesReportPage />,
                    handle: {
                      title: 'Reporte de ventas',
                      breadcrumb: ['Inicio', 'Reportes', 'Ventas'],
                    } satisfies RouteHandle,
                  },
                  {
                    path: 'ventas-diarias',
                    element: <DailySalesReportPage />,
                    handle: {
                      title: 'Ventas diarias',
                      breadcrumb: ['Inicio', 'Reportes', 'Ventas diarias'],
                    } satisfies RouteHandle,
                  },
                  {
                    path: 'productos-top',
                    element: <TopProductsReportPage />,
                    handle: {
                      title: 'Productos más vendidos',
                      breadcrumb: ['Inicio', 'Reportes', 'Más vendidos'],
                    } satisfies RouteHandle,
                  },
                  {
                    path: 'stock-bajo',
                    element: <LowStockReportPage />,
                    handle: {
                      title: 'Stock bajo',
                      breadcrumb: ['Inicio', 'Reportes', 'Stock bajo'],
                    } satisfies RouteHandle,
                  },
                  {
                    path: 'inventario',
                    element: <InventoryReportPage />,
                    handle: {
                      title: 'Inventario valorizado',
                      breadcrumb: ['Inicio', 'Reportes', 'Inventario'],
                    } satisfies RouteHandle,
                  },
                ],
              },
              {
                path: 'usuarios',
                element: <UsersPage />,
                handle: {
                  title: 'Usuarios',
                  breadcrumb: ['Inicio', 'Usuarios'],
                } satisfies RouteHandle,
              },
              {
                path: 'usuarios/:id',
                element: <UserDetailPage />,
                handle: {
                  title: 'Detalle de usuario',
                  breadcrumb: ['Inicio', 'Usuarios', 'Detalle'],
                } satisfies RouteHandle,
              },
            ],
          },
          ...placeholderRoutes,
          {
            path: '*',
            element: <NotFoundPage />,
            handle: { title: 'Página no encontrada' } satisfies RouteHandle,
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
