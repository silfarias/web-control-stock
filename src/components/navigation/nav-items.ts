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

export type NavItem = {
  title: string
  to: string
  icon: LucideIcon
  available: boolean
  description?: string
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
      },
    ],
  },
]

export function findNavItem(pathname: string) {
  return navigation.flatMap((section) => section.items).find((item) => item.to === pathname)
}
