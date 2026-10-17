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

export type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  available: boolean
  description?: string
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
      },
      {
        title: 'Proveedores',
        to: '/proveedores',
        icon: Truck,
        available: true,
      },
      {
        title: 'Compras',
        to: '/compras',
        icon: ClipboardList,
        available: true,
      },
      {
        title: 'Caja',
        to: '/caja',
        icon: Wallet,
        available: true,
      },
      {
        title: 'Ventas',
        to: '/ventas',
        icon: ShoppingBag,
        available: true,
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

function isItemVisibleForRole(item: NavItem, role: UsuarioRole | null | undefined) {
  if (!item.roles || item.roles.length === 0) return true
  if (!role) return false
  return item.roles.includes(role)
}

/** Navegación filtrada por rol. Fuente única de permisos de menú. */
export function getNavigationForRole(role: UsuarioRole | null | undefined): NavSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isItemVisibleForRole(item, role)),
    }))
    .filter((section) => section.items.length > 0)
}

export function findNavItem(pathname: string) {
  return navigation.flatMap((section) => section.items).find((item) => item.to === pathname)
}
