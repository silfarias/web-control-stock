import {
  ChartColumn,
  ClipboardList,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Truck,
  Users,
  Wallet,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import type { UsuarioRole } from '@/features/auth/types'

export type NavChild = {
  title: string
  to: string
  roles?: UsuarioRole[]
}

export type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  available: boolean
  description?: string
  /** Subítems. El `to` del padre es el destino al pulsarlo. */
  children?: NavChild[]
  /**
   * Si se define, el ítem solo se muestra a esos roles.
   * Sin `roles` = visible para cualquier usuario autenticado.
   * La autorización de rutas sigue en RequireAuth / RequireAdmin.
   */
  roles?: UsuarioRole[]
}

export type NavSection = {
  label: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    label: 'General',
    items: [
      {
        title: 'Panel',
        to: '/',
        icon: LayoutDashboard,
        available: true,
      },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      {
        title: 'Productos',
        to: '/productos',
        icon: Package,
        available: true,
      },
      {
        title: 'Categorías',
        to: '/categorias',
        icon: Tags,
        available: true,
      },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      {
        title: 'Inventario',
        to: '/inventario',
        icon: Warehouse,
        available: true,
        children: [
          { title: 'Inventario productos', to: '/inventario' },
          { title: 'Movimientos', to: '/inventario/movimientos' },
        ],
      },
      {
        title: 'Proveedores',
        to: '/proveedores',
        icon: Truck,
        available: true,
      },
      {
        title: 'Compras',
        to: '/compras/nueva',
        icon: ClipboardList,
        available: true,
        children: [
          { title: 'Nueva compra', to: '/compras/nueva', roles: ['ADMIN'] },
          { title: 'Historial de compras', to: '/compras' },
        ],
      },
      {
        title: 'Caja',
        to: '/caja',
        icon: Wallet,
        available: true,
      },
      {
        title: 'Ventas',
        to: '/ventas/nueva',
        icon: ShoppingBag,
        available: true,
        children: [
          { title: 'Nueva venta', to: '/ventas/nueva' },
          { title: 'Historial de ventas', to: '/ventas' },
        ],
      },
    ],
  },
  {
    label: 'Gestión',
    items: [
      {
        title: 'Reportes',
        to: '/reportes',
        icon: ChartColumn,
        available: true,
      },
      {
        title: 'Usuarios',
        to: '/usuarios',
        icon: Users,
        available: true,
        roles: ['ADMIN'],
      },
    ],
  },
]

function isVisibleForRole(
  roles: UsuarioRole[] | undefined,
  role: UsuarioRole | null | undefined,
) {
  if (!roles || roles.length === 0) return true
  if (!role) return false
  return roles.includes(role)
}

function withVisibleChildren(item: NavItem, role: UsuarioRole | null | undefined): NavItem {
  if (!item.children?.length) return item
  const children = item.children.filter((child) => isVisibleForRole(child.roles, role))
  if (children.length <= 1) {
    return { ...item, to: children[0]?.to ?? item.to, children: undefined }
  }
  const to = children.some((child) => child.to === item.to) ? item.to : children[0].to
  return { ...item, to, children }
}

/** Navegación filtrada por rol. Fuente única de permisos de menú. */
export function getNavigationForRole(role: UsuarioRole | null | undefined): NavSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => isVisibleForRole(item.roles, role))
        .map((item) => withVisibleChildren(item, role)),
    }))
    .filter((section) => section.items.length > 0)
}

export function findNavItem(pathname: string) {
  return navigation.flatMap((section) => section.items).find((item) => item.to === pathname)
}
